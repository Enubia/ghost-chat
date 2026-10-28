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

	"ghost-chat/internal/chat"
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
		c.pollLoop(ctx, "https://www.youtube.com/watch?v=x", "tok", YtCfg{}, false)
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

type fakeYouTube struct {
	mu    sync.Mutex
	live  bool
	ended bool
	polls int
}

func (f *fakeYouTube) set(live, ended bool) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.live, f.ended = live, ended
}

func (f *fakeYouTube) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	f.mu.Lock()
	defer f.mu.Unlock()

	switch {
	case r.Method == http.MethodPost:
		f.polls++
		if f.ended {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		_, _ = io.WriteString(w, `{}`)
	case strings.HasSuffix(r.URL.Path, "/live"):
		if f.live {
			_, _ = io.WriteString(w, `<link rel="canonical" href="https://www.youtube.com/watch?v=abcdefghijk">`)
			return
		}
		_, _ = io.WriteString(w, `<link rel="canonical" href="https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA">`)
	default:
		_, _ = io.WriteString(w, watchPage(f.ended))
	}
}

type eventLog struct {
	mu     sync.Mutex
	events []string
}

func (l *eventLog) add(e string, _ any) {
	l.mu.Lock()
	l.events = append(l.events, e)
	l.mu.Unlock()
}

func (l *eventLog) snapshot() []string {
	l.mu.Lock()
	defer l.mu.Unlock()

	return append([]string(nil), l.events...)
}

func (l *eventLog) waitFor(t *testing.T, want ...string) {
	t.Helper()

	deadline := time.Now().Add(10 * time.Second)
	for time.Now().Before(deadline) {
		got := l.snapshot()
		if len(got) >= len(want) && strings.Join(got[:len(want)], ",") == strings.Join(want, ",") {
			return
		}

		time.Sleep(5 * time.Millisecond)
	}

	t.Fatalf("events = %v, want prefix %v", l.snapshot(), want)
}

func newTestClient(t *testing.T, f *fakeYouTube) (*Client, *eventLog) {
	t.Helper()

	srv := httptest.NewServer(f)
	t.Cleanup(srv.Close)

	target, _ := url.Parse(srv.URL)
	log := &eventLog{}

	c := NewClient(func(chat.ChatMessage) {}, log.add)
	c.hc = &http.Client{Transport: rewriteTransport{target: target}}
	c.waitInterval = func() time.Duration { return 5 * time.Millisecond }
	t.Cleanup(c.Disconnect)

	return c, log
}

func TestConnectOfflineChannelWaitsThenConnects(t *testing.T) {
	f := &fakeYouTube{}
	c, log := newTestClient(t, f)

	if err := c.Connect("@MrBeast"); err != nil {
		t.Fatalf("Connect: %v", err)
	}

	log.waitFor(t, "chat:waiting")
	time.Sleep(30 * time.Millisecond)

	if got := log.snapshot(); len(got) != 1 {
		t.Fatalf("events while offline = %v, want [chat:waiting]", got)
	}

	f.set(true, false)
	log.waitFor(t, "chat:waiting", "chat:connected")
}

func TestChannelStreamEndReturnsToWaiting(t *testing.T) {
	f := &fakeYouTube{live: true}
	c, log := newTestClient(t, f)

	if err := c.Connect("@LofiGirl"); err != nil {
		t.Fatalf("Connect: %v", err)
	}

	log.waitFor(t, "chat:connected")

	f.set(false, true)
	log.waitFor(t, "chat:connected", "chat:waiting")

	f.set(true, false)
	log.waitFor(t, "chat:connected", "chat:waiting", "chat:connected")
}

func TestVideoStreamEndDisconnects(t *testing.T) {
	f := &fakeYouTube{ended: false}
	c, log := newTestClient(t, f)

	if err := c.Connect("https://www.youtube.com/watch?v=abcdefghijk"); err != nil {
		t.Fatalf("Connect: %v", err)
	}

	log.waitFor(t, "chat:connected")

	f.set(false, true)
	log.waitFor(t, "chat:connected", "chat:disconnected")
	time.Sleep(50 * time.Millisecond)

	for _, e := range log.snapshot() {
		if e == "chat:waiting" {
			t.Fatalf("events = %v, want no waiting for video input", log.snapshot())
		}
	}
}

func TestDisconnectWhileWaiting(t *testing.T) {
	f := &fakeYouTube{}
	c, log := newTestClient(t, f)

	if err := c.Connect("@MrBeast"); err != nil {
		t.Fatalf("Connect: %v", err)
	}

	log.waitFor(t, "chat:waiting")
	c.Disconnect()
	log.waitFor(t, "chat:waiting", "chat:disconnected")

	f.set(true, false)
	time.Sleep(50 * time.Millisecond)

	if got := log.snapshot(); len(got) != 2 {
		t.Fatalf("events = %v, want [chat:waiting chat:disconnected]", got)
	}
}

func TestReconnectWhileWaitingRestarts(t *testing.T) {
	f := &fakeYouTube{}
	c, log := newTestClient(t, f)

	_ = c.Connect("@MrBeast")
	log.waitFor(t, "chat:waiting")

	_ = c.Connect("@MrBeast")
	log.waitFor(t, "chat:waiting", "chat:waiting")

	f.set(true, false)
	log.waitFor(t, "chat:waiting", "chat:waiting", "chat:connected")
}
