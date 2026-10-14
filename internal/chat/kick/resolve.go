package kick

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

var httpClient = &http.Client{Timeout: 10 * time.Second}

// ResolveChannelSlug normalises any user input to a bare Kick channel slug.
// Accepts: "xqc", "https://kick.com/xqc", "kick.com/xqc".
func ResolveChannelSlug(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("empty input")
	}

	input = strings.TrimPrefix(input, "https://")
	input = strings.TrimPrefix(input, "http://")
	input = strings.TrimPrefix(input, "www.kick.com/")
	input = strings.TrimPrefix(input, "kick.com/")
	input = strings.Trim(input, "/")
	input = strings.ToLower(input)

	if input == "" {
		return "", fmt.Errorf("could not extract channel slug from input")
	}

	return input, nil
}

// FetchChannel calls the Kick channel API to resolve a slug to its channel and chatroom IDs.
// Browser-like headers are required to pass Cloudflare.
func FetchChannel(slug string) (channelID int, chatroomID int, err error) {
	req, err := http.NewRequest("GET", "https://kick.com/api/v1/channels/"+slug, nil)
	if err != nil {
		return 0, 0, err
	}

	req.Header.Set("User-Agent", kickUA)
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Referer", "https://kick.com/")
	req.Header.Set("Origin", "https://kick.com")

	resp, err := httpClient.Do(req)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to fetch channel: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return 0, 0, fmt.Errorf("channel %q not found on Kick", slug)
	}
	if resp.StatusCode != http.StatusOK {
		return 0, 0, fmt.Errorf("http %d for channel %q", resp.StatusCode, slug)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to read response: %w", err)
	}

	var ch ChannelResponse
	if err := json.Unmarshal(body, &ch); err != nil {
		return 0, 0, fmt.Errorf("failed to parse channel response: %w", err)
	}

	if ch.Chatroom.ID == 0 {
		return 0, 0, fmt.Errorf("chatroom ID not found for channel %q", slug)
	}

	return ch.ID, ch.Chatroom.ID, nil
}

type PusherConfig struct {
	AppKey  string
	Cluster string
}

var defaultPusherConfig = PusherConfig{AppKey: "34bf7a0ff419a2a775b9", Cluster: "us2"}

func (p PusherConfig) URL() string {
	return fmt.Sprintf("wss://ws-%s.pusher.com/app/%s?protocol=7&client=js&version=8.4.0&flash=false", p.Cluster, p.AppKey)
}

// FetchPusherConfig asks Kick's realtime API for the current Pusher app key and cluster,
// restricting accepted providers to Pusher so the response never switches to Centrifugo.
func FetchPusherConfig(channelID int) (PusherConfig, error) {
	payload := []byte(`{"client":{"id":"ghost-chat","type":"web"},"capabilities":{"accepted_providers":[{"provider":"pusher"}]}}`)
	url := fmt.Sprintf("https://web.kick.com/api/v1/realtime/channels/%d/chat/connection", channelID)

	req, err := http.NewRequest("POST", url, bytes.NewReader(payload))
	if err != nil {
		return PusherConfig{}, err
	}

	req.Header.Set("User-Agent", kickUA)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Referer", "https://kick.com/")
	req.Header.Set("Origin", "https://kick.com")

	resp, err := httpClient.Do(req)
	if err != nil {
		return PusherConfig{}, fmt.Errorf("failed to fetch realtime config: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return PusherConfig{}, fmt.Errorf("http %d for realtime config", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return PusherConfig{}, fmt.Errorf("failed to read realtime config: %w", err)
	}

	return parsePusherConfig(body)
}

func parsePusherConfig(body []byte) (PusherConfig, error) {
	var rc realtimeConnectionResponse
	if err := json.Unmarshal(body, &rc); err != nil {
		return PusherConfig{}, fmt.Errorf("failed to parse realtime config: %w", err)
	}

	for _, c := range rc.Data.Connections {
		if c.Provider != "pusher" || c.Credentials.AppKey == "" || c.Credentials.Cluster == "" {
			continue
		}

		return PusherConfig{AppKey: c.Credentials.AppKey, Cluster: c.Credentials.Cluster}, nil
	}

	return PusherConfig{}, fmt.Errorf("no pusher connection in realtime config")
}
