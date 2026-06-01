package youtube

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand/v2"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"

	"ghost-chat/internal/chat"
)

const (
	browserUA               = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
	liveChatURL             = "https://www.youtube.com/youtubei/v1/live_chat/get_live_chat"
	defaultPollInterval     = 2 * time.Second
	maxBackoff              = 60 * time.Second
	rateLimitBackoffBase    = 30 * time.Second
	rateLimitBackoffMax     = 5 * time.Minute
	maxFailuresBeforeReboot = 3
)

// ErrRateLimited means YouTube served its anti-bot interstitial (the /sorry page)
// or a 429. The IP is temporarily blocked; only a long backoff helps.
var ErrRateLimited = errors.New("youtube rate-limited this ip (anti-bot)")

// ErrAuthStale means the request was rejected as unauthenticated (401/403),
// usually because the continuation token or innertube config has expired.
var ErrAuthStale = errors.New("youtube auth/config stale")

var httpClient = newHTTPClient()

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

	ctx, cancel := context.WithCancel(context.Background())

	continuation, cfg, err := fetchInitialData(ctx, videoURL)
	if err != nil {
		cancel()
		return fmt.Errorf("failed to fetch initial data: %w", err)
	}

	c.ctx = ctx
	c.cancel = cancel

	c.OnEvent("chat:connected", map[string]string{"platform": "youtube"})

	go c.pollLoop(videoURL, continuation, cfg)

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

func (c *Client) pollLoop(videoURL, continuation string, cfg YtCfg) {
	backoff := defaultPollInterval
	rlFailures := 0
	failures := 0

	for {
		select {
		case <-c.ctx.Done():
			return
		default:
		}

		messages, deletions, nextCont, timeoutMs, err := pollChatOnce(c.ctx, continuation, cfg)
		if err != nil {
			if c.ctx.Err() != nil {
				return
			}

			var wait time.Duration

			switch {
			case errors.Is(err, ErrRateLimited):
				rlFailures++
				wait = rateLimitBackoff(rlFailures)
				logf("rate-limited, backing off %v", wait)

			case errors.Is(err, ErrAuthStale):
				logf("auth/config stale, re-bootstrapping: %v", err)
				if c.rebootstrap(videoURL, &continuation, &cfg) {
					failures, backoff = 0, defaultPollInterval
					continue
				}
				wait, backoff = backoff, nextBackoff(backoff)

			default:
				failures++
				logf("poll error: %v (failure %d/%d)", err, failures, maxFailuresBeforeReboot)
				if failures >= maxFailuresBeforeReboot && c.rebootstrap(videoURL, &continuation, &cfg) {
					failures, backoff = 0, defaultPollInterval
					continue
				}
				wait, backoff = backoff, nextBackoff(backoff)
			}

			select {
			case <-c.ctx.Done():
				return
			case <-time.After(wait):
			}

			continue
		}

		rlFailures, failures = 0, 0
		backoff = defaultPollInterval

		for _, msg := range messages {
			c.OnMessage(msg)
		}

		for _, id := range deletions {
			c.OnEvent("chat:delete-message", id)
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

// rebootstrap re-fetches the watch page to recover a fresh continuation token and
// innertube config, used when the current ones go stale. Returns true on success.
func (c *Client) rebootstrap(videoURL string, continuation *string, cfg *YtCfg) bool {
	newCont, newCfg, err := fetchInitialData(c.ctx, videoURL)
	if err != nil {
		logf("re-bootstrap failed: %v", err)
		return false
	}

	*continuation = newCont
	*cfg = newCfg

	return true
}

// fetchInitialData fetches a YouTube watch page, extracts the first live chat
// continuation token and innertube client config.
func fetchInitialData(ctx context.Context, videoURL string) (continuation string, cfg YtCfg, err error) {
	body, err := doRequest(ctx, "GET", videoURL, nil, nil)
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

	cfg = YtCfg{
		InnertubeAPIKey:        extractStringField(html, "INNERTUBE_API_KEY"),
		InnertubeClientName:    extractStringField(html, "INNERTUBE_CLIENT_NAME"),
		InnertubeClientVersion: extractStringField(html, "INNERTUBE_CLIENT_VERSION"),
		ClientNameNumeric:      extractNumberField(html, "INNERTUBE_CONTEXT_CLIENT_NAME"),
	}

	// Prefer the whole INNERTUBE_CONTEXT object — it carries visitorData and any
	// fields YouTube starts requiring, so the poll body stays valid across changes.
	if ctxJSON, err := extractJSONObject(html, `"INNERTUBE_CONTEXT"`); err == nil {
		var ctxObj map[string]any
		if json.Unmarshal(ctxJSON, &ctxObj) == nil {
			cfg.Context = ctxObj
		}
	}

	cfg.VisitorData = extractVisitorData(html, cfg.Context)

	return cont, cfg, nil
}

// pollChatOnce sends one request to the innertube live_chat endpoint and returns
// the parsed messages, deletion target IDs, the next continuation token, and the
// suggested polling interval.
func pollChatOnce(ctx context.Context, continuation string, cfg YtCfg) (messages []chat.ChatMessage, deletions []string, nextContinuation string, timeoutMs int, err error) {
	reqBody, err := buildPollRequestBody(continuation, cfg)
	if err != nil {
		return nil, nil, "", 0, err
	}

	pollURL := liveChatURL
	if cfg.InnertubeAPIKey != "" {
		pollURL += "?key=" + cfg.InnertubeAPIKey
	}

	hdr := http.Header{}
	if cfg.VisitorData != "" {
		hdr.Set("X-Goog-Visitor-Id", cfg.VisitorData)
	}
	if cfg.ClientNameNumeric != "" {
		hdr.Set("X-YouTube-Client-Name", cfg.ClientNameNumeric)
	}
	if cfg.InnertubeClientVersion != "" {
		hdr.Set("X-YouTube-Client-Version", cfg.InnertubeClientVersion)
	}

	respBody, err := doRequest(ctx, "POST", pollURL, reqBody, hdr)
	if err != nil {
		return nil, nil, "", 0, err
	}

	// A blocked request can return 200 with an HTML interstitial instead of JSON.
	if looksLikeHTML(respBody) {
		return nil, nil, "", 0, ErrRateLimited
	}

	var resp LiveChatResponse
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, nil, "", 0, fmt.Errorf("failed to parse response: %w", err)
	}

	lcc := resp.ContinuationContents.LiveChatContinuation
	nextCont, timeout := extractContinuation(lcc.Continuations)
	msgs, dels := parseActions(lcc.Actions)

	return msgs, dels, nextCont, timeout, nil
}

func buildPollRequestBody(continuation string, cfg YtCfg) ([]byte, error) {
	var clientContext any
	if cfg.Context != nil {
		clientContext = cfg.Context
	} else {
		clientContext = map[string]any{
			"client": map[string]any{
				"clientName":    cfg.InnertubeClientName,
				"clientVersion": cfg.InnertubeClientVersion,
			},
		}
	}

	body := map[string]any{
		"context":      clientContext,
		"continuation": continuation,
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

// extractVisitorData pulls the session's visitorData, preferring the value inside
// the parsed INNERTUBE_CONTEXT and falling back to a raw scrape of the page.
func extractVisitorData(html string, ctxObj map[string]any) string {
	if ctxObj != nil {
		if client, ok := ctxObj["client"].(map[string]any); ok {
			if vd, ok := client["visitorData"].(string); ok && vd != "" {
				return vd
			}
		}
	}
	return extractStringField(html, "VISITOR_DATA")
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

// extractNumberField extracts the value of an unquoted numeric JSON field,
// e.g. `"INNERTUBE_CONTEXT_CLIENT_NAME":1` returns "1".
func extractNumberField(s, key string) string {
	re := regexp.MustCompile(`"` + regexp.QuoteMeta(key) + `"\s*:\s*(\d+)`)
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

// doRequest performs an HTTP request with a browser-like header set and classifies
// the common failure modes (rate-limit, stale auth) into typed errors.
func doRequest(ctx context.Context, method, requestURL string, body []byte, extraHeaders http.Header) ([]byte, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}

	req, err := http.NewRequestWithContext(ctx, method, requestURL, bodyReader)
	if err != nil {
		return nil, err
	}

	setBrowserHeaders(req)

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	for k, vs := range extraHeaders {
		for _, v := range vs {
			req.Header.Set(k, v)
		}
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		if errors.Is(err, ErrRateLimited) {
			return nil, ErrRateLimited
		}
		return nil, err
	}
	defer resp.Body.Close()

	switch {
	case resp.StatusCode == http.StatusTooManyRequests:
		return nil, ErrRateLimited
	case resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden:
		return nil, fmt.Errorf("%w: http %d", ErrAuthStale, resp.StatusCode)
	case resp.StatusCode != http.StatusOK:
		return nil, fmt.Errorf("http %d from %s", resp.StatusCode, requestURL)
	}

	return io.ReadAll(resp.Body)
}

// setBrowserHeaders applies a header set resembling a real Chrome request. GET
// requests are treated as top-level navigations, everything else as a CORS fetch
// (matching how the innertube API is called from the page).
func setBrowserHeaders(req *http.Request) {
	req.Header.Set("User-Agent", browserUA)
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Sec-Ch-Ua", `"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"`)
	req.Header.Set("Sec-Ch-Ua-Mobile", "?0")
	req.Header.Set("Sec-Ch-Ua-Platform", `"Windows"`)

	if req.Method == http.MethodGet {
		req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
		req.Header.Set("Sec-Fetch-Dest", "document")
		req.Header.Set("Sec-Fetch-Mode", "navigate")
		req.Header.Set("Sec-Fetch-User", "?1")
		req.Header.Set("Sec-Fetch-Site", "none")
		return
	}

	req.Header.Set("Accept", "*/*")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-origin")
}

// newHTTPClient returns the shared HTTP client: a cookie jar seeded with consent
// cookies so the resolve → page → poll sequence looks like one browser session,
// and a redirect guard that detects YouTube's anti-bot /sorry interstitial.
func newHTTPClient() *http.Client {
	jar, _ := cookiejar.New(nil)
	seedConsentCookies(jar)

	return &http.Client{
		Timeout: 10 * time.Second,
		Jar:     jar,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if isSorryURL(req.URL) {
				return ErrRateLimited
			}
			if len(via) >= 10 {
				return errors.New("stopped after 10 redirects")
			}
			return nil
		},
	}
}

func seedConsentCookies(jar http.CookieJar) {
	for _, host := range []string{"https://www.youtube.com", "https://www.google.com"} {
		u, err := url.Parse(host)
		if err != nil {
			continue
		}
		jar.SetCookies(u, []*http.Cookie{
			{Name: "SOCS", Value: "CAI", Path: "/"},
			{Name: "CONSENT", Value: "YES+", Path: "/"},
		})
	}
}

// isSorryURL reports whether u is Google's anti-bot interstitial.
func isSorryURL(u *url.URL) bool {
	if u == nil {
		return false
	}
	return strings.HasPrefix(u.Path, "/sorry") || strings.HasPrefix(u.Host, "consent.")
}

func looksLikeHTML(b []byte) bool {
	return bytes.HasPrefix(bytes.TrimSpace(b), []byte("<"))
}

func rateLimitBackoff(failures int) time.Duration {
	d := min(rateLimitBackoffBase*time.Duration(failures), rateLimitBackoffMax)
	return d + time.Duration(rand.Int64N(int64(5*time.Second)))
}

func nextBackoff(d time.Duration) time.Duration {
	return min(d*2, maxBackoff)
}

func logf(format string, args ...any) {
	fmt.Printf("[youtube] "+format+"\n", args...)
}
