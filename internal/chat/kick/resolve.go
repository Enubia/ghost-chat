package kick

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

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

// FetchChatroomID calls the Kick channel API to resolve a slug to a chatroom integer ID.
// Browser-like headers are required to pass Cloudflare.
func FetchChatroomID(slug string) (int, error) {
	req, err := http.NewRequest("GET", "https://kick.com/api/v1/channels/"+slug, nil)
	if err != nil {
		return 0, err
	}

	req.Header.Set("User-Agent", kickUA)
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Referer", "https://kick.com/")
	req.Header.Set("Origin", "https://kick.com")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("failed to fetch channel: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return 0, fmt.Errorf("channel %q not found on Kick", slug)
	}
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("http %d for channel %q", resp.StatusCode, slug)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("failed to read response: %w", err)
	}

	var ch ChannelResponse
	if err := json.Unmarshal(body, &ch); err != nil {
		return 0, fmt.Errorf("failed to parse channel response: %w", err)
	}

	if ch.Chatroom.ID == 0 {
		return 0, fmt.Errorf("chatroom ID not found for channel %q", slug)
	}

	return ch.Chatroom.ID, nil
}
