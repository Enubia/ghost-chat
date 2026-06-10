package main

import (
	"ghost-chat/internal/chat"
	"ghost-chat/internal/config"
	"sync"
	"testing"
)

type fakeClient struct {
	mu        sync.Mutex
	connected bool
	lastInput string
	calls     []string
	onMessage func(chat.ChatMessage)
}

func (f *fakeClient) Connect(input string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	if f.connected {
		f.connected = false
		f.calls = append(f.calls, "disconnect")
	}

	f.connected = true
	f.lastInput = input
	f.calls = append(f.calls, "connect:"+input)

	return nil
}

func (f *fakeClient) Disconnect() {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.connected = false
	f.calls = append(f.calls, "disconnect")
}

func (f *fakeClient) deliver(msg chat.ChatMessage) {
	f.onMessage(msg)
}

type emitRecord struct {
	event string
	data  any
}

func newTestApp() (*App, *fakeClient, *[]emitRecord) {
	cfg := &config.Config{}
	a := NewApp(cfg, "", "test")

	fc := &fakeClient{}

	var mu sync.Mutex
	var records []emitRecord

	a.emit = func(event string, data any) {
		mu.Lock()
		defer mu.Unlock()

		records = append(records, emitRecord{event: event, data: data})
	}

	fc.onMessage = func(msg chat.ChatMessage) {
		a.emit("chat:message", msg)
	}

	a.clients = map[chat.Platform]chat.Client{
		chat.PlatformTwitch: fc,
	}

	return a, fc, &records
}

func TestConnectUnknownPlatform(t *testing.T) {
	a, _, _ := newTestApp()

	err := a.Connect("invalid", "whatever")

	if err == nil {
		t.Fatal("expected error for unknown platform, got nil")
	}
}

func TestDisconnectUnknownPlatform(t *testing.T) {
	a, _, _ := newTestApp()

	err := a.Disconnect("invalid")

	if err == nil {
		t.Fatal("expected error for unknown platform, got nil")
	}
}

func TestConnectCallsClient(t *testing.T) {
	a, fc, _ := newTestApp()

	err := a.Connect(chat.PlatformTwitch, "streamer")

	if err != nil {
		t.Fatalf("Connect returned unexpected error: %v", err)
	}

	fc.mu.Lock()
	defer fc.mu.Unlock()

	if !fc.connected {
		t.Error("expected client to be connected")
	}

	if fc.lastInput != "streamer" {
		t.Errorf("lastInput = %q, want %q", fc.lastInput, "streamer")
	}
}

func TestDisconnectCallsClient(t *testing.T) {
	a, fc, _ := newTestApp()

	err := a.Connect(chat.PlatformTwitch, "streamer")
	if err != nil {
		t.Fatalf("Connect: %v", err)
	}

	err = a.Disconnect(chat.PlatformTwitch)
	if err != nil {
		t.Fatalf("Disconnect: %v", err)
	}

	fc.mu.Lock()
	defer fc.mu.Unlock()

	if fc.connected {
		t.Error("expected client to be disconnected")
	}
}

func TestConnectWhileConnectedDisconnectsFirst(t *testing.T) {
	a, fc, _ := newTestApp()

	if err := a.Connect(chat.PlatformTwitch, "first"); err != nil {
		t.Fatalf("first Connect: %v", err)
	}

	if err := a.Connect(chat.PlatformTwitch, "second"); err != nil {
		t.Fatalf("second Connect: %v", err)
	}

	fc.mu.Lock()
	calls := append([]string(nil), fc.calls...)
	fc.mu.Unlock()

	if len(calls) < 3 {
		t.Fatalf("expected at least 3 calls, got %d: %v", len(calls), calls)
	}

	if calls[0] != "connect:first" {
		t.Errorf("calls[0] = %q, want %q", calls[0], "connect:first")
	}

	if calls[1] != "disconnect" {
		t.Errorf("calls[1] = %q, want %q (disconnect must precede second connect)", calls[1], "disconnect")
	}

	if calls[2] != "connect:second" {
		t.Errorf("calls[2] = %q, want %q", calls[2], "connect:second")
	}
}

func TestEmitSeam_MessageFlowsThroughEmitter(t *testing.T) {
	a, fc, records := newTestApp()

	err := a.Connect(chat.PlatformTwitch, "streamer")
	if err != nil {
		t.Fatalf("Connect: %v", err)
	}

	msg := chat.ChatMessage{
		ID:       "test-id",
		Platform: string(chat.PlatformTwitch),
		Username: "viewer",
		Text:     "hello",
	}

	fc.deliver(msg)

	if len(*records) == 0 {
		t.Fatal("expected at least one emit record, got none")
	}

	found := false

	for _, r := range *records {
		if r.event == "chat:message" {
			cm, ok := r.data.(chat.ChatMessage)

			if !ok {
				t.Fatalf("emit data is %T, want chat.ChatMessage", r.data)
			}

			if cm.ID == "test-id" && cm.Username == "viewer" {
				found = true
			}
		}
	}

	if !found {
		t.Errorf("chat:message with correct payload not found in records: %+v", *records)
	}
}
