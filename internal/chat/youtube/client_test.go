package youtube

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"
	"time"
)

func watchPage(isReplay bool) string {
	flag := "false"
	if isReplay {
		flag = "true"
	}

	return `<html><script>var ytInitialData = {"contents":{"twoColumnWatchNextResults":{"conversationBar":{"liveChatRenderer":{"isReplay":` + flag + `,"continuations":[{"reloadContinuationData":{"continuation":"tok"}}]}}}}};</script></html>`
}

func TestParseWatchPageReplay(t *testing.T) {
	_, _, err := parseWatchPage(watchPage(true))
	if !errors.Is(err, ErrNotLive) {
		t.Fatalf("replay page: got %v, want ErrNotLive", err)
	}
}

func TestParseWatchPageLive(t *testing.T) {
	cont, _, err := parseWatchPage(watchPage(false))
	if err != nil {
		t.Fatalf("live page: unexpected error %v", err)
	}
	if cont != "tok" {
		t.Errorf("continuation = %q, want %q", cont, "tok")
	}
}

func TestDoRequestIncludesBodySnippet(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = io.WriteString(w, `{"error":{"code":400,"message":"Request contains an invalid argument.","status":"INVALID_ARGUMENT"}}`)
	}))
	defer srv.Close()

	_, err := doRequest(context.Background(), httpClient, "POST", srv.URL, []byte("{}"), nil)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "INVALID_ARGUMENT") || !strings.Contains(err.Error(), "http 400") {
		t.Errorf("error %q lacks status and body snippet", err)
	}
}

type rewriteTransport struct{ target *url.URL }

func (rt rewriteTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	r = r.Clone(r.Context())
	r.URL.Scheme = rt.target.Scheme
	r.URL.Host = rt.target.Host

	return http.DefaultTransport.RoundTrip(r)
}

func TestPollLoopDisconnectsWhenStreamEnds(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		_, _ = io.WriteString(w, watchPage(true))
	}))
	defer srv.Close()

	target, _ := url.Parse(srv.URL)

	var mu sync.Mutex
	var events []string

	c := NewClient(nil, func(event string, _ any) {
		mu.Lock()
		events = append(events, event)
		mu.Unlock()
	})

	c.hc = &http.Client{Transport: rewriteTransport{target: target}}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c.cancel = cancel

	done := make(chan struct{})

	go func() {
		c.pollLoop(ctx, "https://www.youtube.com/watch?v=x", "tok", YtCfg{})
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(30 * time.Second):
		t.Fatal("pollLoop did not stop after stream ended")
	}

	mu.Lock()
	defer mu.Unlock()
	if len(events) != 1 || events[0] != "chat:disconnected" {
		t.Errorf("events = %v, want [chat:disconnected]", events)
	}
}
