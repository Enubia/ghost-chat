package youtube

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"ghost-chat/internal/chat"
)

const (
	browserUA           = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
	liveChatURL         = "https://www.youtube.com/youtubei/v1/live_chat/get_live_chat"
	defaultPollInterval = 2 * time.Second
	maxBackoff          = 60 * time.Second
)

type MessageHandler func(chat.ChatMessage)
type EventHandler func(event string, data any)

type Client struct {
	mu     sync.Mutex
	ctx    context.Context
	cancel context.CancelFunc

	OnMessage MessageHandler
	OnEvent   EventHandler
}

func NewClient(onMessage MessageHandler, onEvent EventHandler) *Client {
	return &Client{
		OnMessage: onMessage,
		OnEvent:   onEvent,
	}
}

func (c *Client) Connect(input string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.cancel != nil {
		c.cancel()
		c.cancel = nil
	}

	videoURL, err := ResolveVideoURL(input)
	if err != nil {
		return fmt.Errorf("failed to resolve video URL: %w", err)
	}

	continuation, cfg, err := fetchInitialData(videoURL)
	if err != nil {
		return fmt.Errorf("failed to fetch initial data: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	c.ctx = ctx
	c.cancel = cancel

	c.OnEvent("chat:connected", map[string]string{"platform": "youtube"})

	go c.pollLoop(continuation, cfg)

	return nil
}

func (c *Client) Disconnect() {
	c.mu.Lock()

	if c.cancel != nil {
		c.cancel()
		c.cancel = nil
	}

	c.mu.Unlock()

	c.OnEvent("chat:disconnected", map[string]string{"platform": "youtube"})
}

func (c *Client) pollLoop(continuation string, cfg YtCfg) {
	backoff := defaultPollInterval

	for {
		select {
		case <-c.ctx.Done():
			return
		default:
		}

		messages, nextCont, timeoutMs, err := pollChatOnce(continuation, cfg)
		if err != nil {
			logf("poll error: %v, retrying in %v", err, backoff)
			select {
			case <-c.ctx.Done():
				return
			case <-time.After(backoff):
			}
			backoff *= 2
			if backoff > maxBackoff {
				backoff = maxBackoff
			}
			continue
		}

		backoff = defaultPollInterval

		for _, msg := range messages {
			c.OnMessage(msg)
		}

		if nextCont != "" {
			continuation = nextCont
		}

		interval := defaultPollInterval
		if timeoutMs > 0 {
			interval = time.Duration(timeoutMs) * time.Millisecond
		}

		select {
		case <-c.ctx.Done():
			return
		case <-time.After(interval):
		}
	}
}

// fetchInitialData fetches a YouTube watch page, extracts the first live chat
// continuation token and innertube client config.
func fetchInitialData(videoURL string) (continuation string, cfg YtCfg, err error) {
	body, err := doRequest("GET", videoURL, nil)
	if err != nil {
		return "", YtCfg{}, fmt.Errorf("failed to fetch page: %w", err)
	}

	html := string(body)

	// Extract ytInitialData JSON
	initDataJSON, err := extractJSONObject(html, "ytInitialData")
	if err != nil {
		return "", YtCfg{}, fmt.Errorf("ytInitialData not found: %w", err)
	}

	var initData map[string]any
	if err := json.Unmarshal(initDataJSON, &initData); err != nil {
		return "", YtCfg{}, fmt.Errorf("failed to parse ytInitialData: %w", err)
	}

	// Navigate to the live chat continuation token.
	// Path: contents → twoColumnWatchNextResults → conversationBar →
	//       liveChatRenderer → continuations[0] → reloadContinuationData → continuation
	contValue, err := navigateJSON(initData,
		"contents", "twoColumnWatchNextResults", "conversationBar",
		"liveChatRenderer", "continuations", 0, "reloadContinuationData", "continuation",
	)
	if err != nil {
		// Fallback path for some page layouts
		contValue, err = navigateJSON(initData,
			"contents", "twoColumnWatchNextResults", "conversationBar",
			"liveChatRenderer", "continuations", 0, "invalidationContinuationData", "continuation",
		)
		if err != nil {
			return "", YtCfg{}, fmt.Errorf("continuation token not found in page: %w", err)
		}
	}

	cont, ok := contValue.(string)
	if !ok {
		return "", YtCfg{}, fmt.Errorf("continuation token is not a string")
	}

	// Extract ytcfg values directly with regexes — more robust than parsing the
	// whole ytcfg.set(...) call, which can appear in non-JSON forms on the page.
	apiKey := extractStringField(html, "INNERTUBE_API_KEY")
	clientName := extractStringField(html, "INNERTUBE_CLIENT_NAME")
	clientVersion := extractStringField(html, "INNERTUBE_CLIENT_VERSION")

	return cont, YtCfg{
		InnertubeAPIKey:        apiKey,
		InnertubeClientName:    clientName,
		InnertubeClientVersion: clientVersion,
	}, nil
}

// pollChatOnce sends one request to the innertube live_chat endpoint and returns
// the parsed messages, the next continuation token, and the suggested polling interval.
func pollChatOnce(continuation string, cfg YtCfg) (messages []chat.ChatMessage, nextContinuation string, timeoutMs int, err error) {
	reqBody, err := buildPollRequestBody(continuation, cfg)
	if err != nil {
		return nil, "", 0, err
	}

	pollURL := liveChatURL
	if cfg.InnertubeAPIKey != "" {
		pollURL += "?key=" + cfg.InnertubeAPIKey
	}

	respBody, err := doRequest("POST", pollURL, reqBody)
	if err != nil {
		return nil, "", 0, err
	}

	var resp LiveChatResponse
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, "", 0, fmt.Errorf("failed to parse response: %w", err)
	}

	lcc := resp.ContinuationContents.LiveChatContinuation
	nextCont, timeout := extractContinuation(lcc.Continuations)
	msgs := parseActions(lcc.Actions)

	return msgs, nextCont, timeout, nil
}

func buildPollRequestBody(continuation string, cfg YtCfg) ([]byte, error) {
	body := map[string]any{
		"continuation": continuation,
		"context": map[string]any{
			"client": map[string]any{
				"clientName":    cfg.InnertubeClientName,
				"clientVersion": cfg.InnertubeClientVersion,
			},
		},
	}
	return json.Marshal(body)
}

func extractContinuation(continuations []Continuation) (token string, timeoutMs int) {
	for _, c := range continuations {
		if c.TimedContinuationData != nil && c.TimedContinuationData.Continuation != "" {
			return c.TimedContinuationData.Continuation, c.TimedContinuationData.TimeoutMs
		}
		if c.InvalidationContinuationData != nil && c.InvalidationContinuationData.Continuation != "" {
			return c.InvalidationContinuationData.Continuation, c.InvalidationContinuationData.TimeoutMs
		}
	}
	return "", 0
}

// extractStringField extracts the value of a JSON string field anywhere in the
// HTML source, e.g. extractStringField(html, "INNERTUBE_API_KEY") returns the
// value of the first `"INNERTUBE_API_KEY":"<value>"` occurrence.
func extractStringField(s, key string) string {
	re := regexp.MustCompile(`"` + regexp.QuoteMeta(key) + `"\s*:\s*"([^"]+)"`)
	m := re.FindStringSubmatch(s)
	if len(m) < 2 {
		return ""
	}
	return m[1]
}

// extractJSONObject finds the first occurrence of marker in s, then uses
// json.Decoder to read the first complete JSON object that follows.
func extractJSONObject(s, marker string) ([]byte, error) {
	idx := strings.Index(s, marker)
	if idx == -1 {
		return nil, fmt.Errorf("marker %q not found", marker)
	}

	braceIdx := strings.Index(s[idx:], "{")
	if braceIdx == -1 {
		return nil, fmt.Errorf("no JSON object after marker %q", marker)
	}

	var raw json.RawMessage
	dec := json.NewDecoder(strings.NewReader(s[idx+braceIdx:]))
	if err := dec.Decode(&raw); err != nil {
		return nil, fmt.Errorf("failed to decode JSON after %q: %w", marker, err)
	}

	return raw, nil
}

// navigateJSON walks a decoded map[string]any / []any tree.
// Keys can be strings (map keys) or ints (slice indices).
func navigateJSON(v any, keys ...any) (any, error) {
	current := v
	for _, key := range keys {
		switch k := key.(type) {
		case string:
			m, ok := current.(map[string]any)
			if !ok {
				return nil, fmt.Errorf("expected map at key %q, got %T", k, current)
			}
			current, ok = m[k]
			if !ok {
				return nil, fmt.Errorf("key %q not found", k)
			}
		case int:
			arr, ok := current.([]any)
			if !ok {
				return nil, fmt.Errorf("expected slice at index %d, got %T", k, current)
			}
			if k < 0 || k >= len(arr) {
				return nil, fmt.Errorf("index %d out of range (len %d)", k, len(arr))
			}
			current = arr[k]
		default:
			return nil, fmt.Errorf("unsupported key type %T", key)
		}
	}
	return current, nil
}

// doRequest performs an HTTP request with a browser User-Agent.
func doRequest(method, url string, body []byte) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", browserUA)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("http %d from %s", resp.StatusCode, url)
	}

	return io.ReadAll(resp.Body)
}

// newHTTPClient returns an HTTP client with browser User-Agent on every request,
// including redirects. Used by resolve.go.
func newHTTPClient() *http.Client {
	return &http.Client{
		Transport: browserRoundTripper{},
	}
}

type browserRoundTripper struct{}

func (browserRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	req = req.Clone(req.Context())
	req.Header.Set("User-Agent", browserUA)
	return http.DefaultTransport.RoundTrip(req)
}

func logf(format string, args ...any) {
	fmt.Printf("[youtube] "+format+"\n", args...)
}
