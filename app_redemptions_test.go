package main

import (
	"path/filepath"
	"sync"
	"testing"

	"ghost-chat/internal/config"

	"github.com/zalando/go-keyring"
)

func TestSetAndClearTwitchChannelTracksState(t *testing.T) {
	dir := t.TempDir()

	cfg := &config.Config{}

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	a.setTwitchChannel("streamer")

	if a.twitchChannel != "streamer" {
		t.Errorf("twitchChannel = %q, want %q", a.twitchChannel, "streamer")
	}

	a.clearTwitchChannel()

	if a.twitchChannel != "" {
		t.Errorf("twitchChannel = %q, want empty", a.twitchChannel)
	}
}

func TestHandleRedemptionAuthLostEmitsLoggedOut(t *testing.T) {
	keyring.MockInit()

	dir := t.TempDir()

	cfg := &config.Config{}
	cfg.Twitch.Account.Login = "streamer"

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	var mu sync.Mutex
	records := map[string]any{}

	a.emit = func(event string, data any) {
		mu.Lock()
		defer mu.Unlock()

		records[event] = data
	}

	a.handleRedemptionAuthLost()

	mu.Lock()
	defer mu.Unlock()

	if _, ok := records["twitch:auth:loggedout"]; !ok {
		t.Error("expected twitch:auth:loggedout event")
	}

	if a.config.Twitch.Account.Login != "" {
		t.Errorf("login = %q, want cleared", a.config.Twitch.Account.Login)
	}
}
