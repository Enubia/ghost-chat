package main

import (
	"errors"
	"sort"
	"testing"

	"ghost-chat/internal/chat"
	"ghost-chat/internal/config"
)

type failingClient struct {
	fakeClient
	err error
}

func (f *failingClient) Connect(input string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.calls = append(f.calls, "connect:"+input)

	return f.err
}

func newAutoConnectApp(cfg *config.Config) (*App, map[chat.Platform]*fakeClient, *failingClient) {
	a := NewApp(cfg, "", "test")

	twitchClient := &fakeClient{}
	kickClient := &fakeClient{}
	youtubeClient := &failingClient{err: errors.New("channel not found")}

	a.clients = map[chat.Platform]chat.Client{
		chat.PlatformTwitch:  twitchClient,
		chat.PlatformKick:    kickClient,
		chat.PlatformYouTube: youtubeClient,
	}

	return a, map[chat.Platform]*fakeClient{
		chat.PlatformTwitch: twitchClient,
		chat.PlatformKick:   kickClient,
	}, youtubeClient
}

func TestAutoConnectOnlyEligiblePlatforms(t *testing.T) {
	cfg := &config.Config{}
	cfg.Twitch.ConnectOnStartup = true
	cfg.Twitch.DefaultChannel = "streamer"
	cfg.Kick.ConnectOnStartup = true
	cfg.Kick.DefaultChannel = ""
	cfg.YouTube.ConnectOnStartup = false
	cfg.YouTube.ChannelID = "UC123"

	a, fakes, yt := newAutoConnectApp(cfg)

	results := a.AutoConnect()

	if len(results) != 1 || results[0].Platform != chat.PlatformTwitch || results[0].Error != "" {
		t.Fatalf("results = %+v, want single twitch success", results)
	}

	if got := fakes[chat.PlatformTwitch].lastInput; got != "streamer" {
		t.Errorf("twitch input = %q, want streamer", got)
	}

	if len(fakes[chat.PlatformKick].calls) != 0 {
		t.Errorf("kick should be skipped, calls = %v", fakes[chat.PlatformKick].calls)
	}

	if len(yt.calls) != 0 {
		t.Errorf("youtube should be skipped, calls = %v", yt.calls)
	}
}

func TestAutoConnectReportsErrorsPerPlatform(t *testing.T) {
	cfg := &config.Config{}
	cfg.Twitch.ConnectOnStartup = true
	cfg.Twitch.DefaultChannel = "streamer"
	cfg.Kick.ConnectOnStartup = true
	cfg.Kick.DefaultChannel = "kicker"
	cfg.YouTube.ConnectOnStartup = true
	cfg.YouTube.ChannelID = "UC123"

	a, fakes, yt := newAutoConnectApp(cfg)

	results := a.AutoConnect()

	if len(results) != 3 {
		t.Fatalf("results = %+v, want 3", results)
	}

	sort.Slice(results, func(i, j int) bool { return results[i].Platform < results[j].Platform })

	byPlatform := map[chat.Platform]string{}

	for _, r := range results {
		byPlatform[r.Platform] = r.Error
	}

	if byPlatform[chat.PlatformTwitch] != "" || byPlatform[chat.PlatformKick] != "" {
		t.Errorf("twitch/kick should succeed: %+v", byPlatform)
	}

	if byPlatform[chat.PlatformYouTube] != "channel not found" {
		t.Errorf("youtube error = %q", byPlatform[chat.PlatformYouTube])
	}

	if fakes[chat.PlatformKick].lastInput != "kicker" {
		t.Errorf("kick input = %q", fakes[chat.PlatformKick].lastInput)
	}

	if len(yt.calls) != 1 || yt.calls[0] != "connect:UC123" {
		t.Errorf("youtube calls = %v", yt.calls)
	}
}

func TestAutoConnectRunsOnce(t *testing.T) {
	cfg := &config.Config{}
	cfg.Twitch.ConnectOnStartup = true
	cfg.Twitch.DefaultChannel = "streamer"

	a, fakes, _ := newAutoConnectApp(cfg)

	if first := a.AutoConnect(); len(first) != 1 {
		t.Fatalf("first = %+v", first)
	}

	if second := a.AutoConnect(); second != nil {
		t.Errorf("second = %+v, want nil", second)
	}

	if n := len(fakes[chat.PlatformTwitch].calls); n != 1 {
		t.Errorf("twitch connect calls = %d, want 1", n)
	}
}

func TestAutoConnectTwitchSetsRedemptionChannel(t *testing.T) {
	cfg := &config.Config{}
	cfg.Twitch.ConnectOnStartup = true
	cfg.Twitch.DefaultChannel = "#Streamer"

	a, _, _ := newAutoConnectApp(cfg)

	a.AutoConnect()

	if a.twitchChannel != "streamer" {
		t.Errorf("twitchChannel = %q, want streamer", a.twitchChannel)
	}
}
