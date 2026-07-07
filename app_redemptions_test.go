package main

import (
	"path/filepath"
	"sync"
	"testing"

	"ghost-chat/internal/chat/twitch"
	"ghost-chat/internal/config"

	"github.com/zalando/go-keyring"
)

func TestSetAndClearTwitchChannelTracksState(t *testing.T) {
	dir := t.TempDir()

	cfg := &config.Config{}

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	cases := []struct {
		name  string
		input string
	}{
		{"plain", "streamer"},
		{"hash prefix", "#Streamer"},
		{"surrounding whitespace", " streamer "},
		{"mixed case", "StReAmEr"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			a.setTwitchChannel(tc.input)

			if a.twitchChannel != "streamer" {
				t.Errorf("twitchChannel = %q, want %q", a.twitchChannel, "streamer")
			}

			if !twitch.ShouldRunRedemptions(true, "streamer", a.twitchChannel) {
				t.Errorf("gate did not match auth login for input %q (stored %q)", tc.input, a.twitchChannel)
			}

			a.clearTwitchChannel()

			if a.twitchChannel != "" {
				t.Errorf("twitchChannel = %q, want empty", a.twitchChannel)
			}
		})
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
