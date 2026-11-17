package youtube

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

var reCanonical = regexp.MustCompile(`<link[^>]+rel=["']canonical["'][^>]*>`)
var reHref = regexp.MustCompile(`href=["']([^"']+)["']`)

var ErrChannelOffline = errors.New("channel is not live")

type resolvedInput struct {
	videoURL string
	liveURL  string
}

func (r resolvedInput) isChannel() bool {
	return r.liveURL != ""
}

func resolveInput(input string) (resolvedInput, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return resolvedInput{}, fmt.Errorf("empty input")
	}

	if strings.HasPrefix(input, "@") {
		input = "https://www.youtube.com/" + input
	}

	if isChannelID(input) {
		input = "https://www.youtube.com/channel/" + input
	}

	if !strings.Contains(input, "://") {
		input = "https://" + input
	}

	u, err := url.Parse(input)
	if err != nil {
		return resolvedInput{}, fmt.Errorf("invalid input: %w", err)
	}

	segments := strings.FieldsFunc(u.Path, func(r rune) bool { return r == '/' })

	switch strings.ToLower(u.Hostname()) {
	case "youtu.be":
		if len(segments) == 0 {
			return resolvedInput{}, fmt.Errorf("no video ID in youtu.be URL")
		}

		return resolvedInput{videoURL: watchURL(segments[0])}, nil

	case "www.youtube.com", "youtube.com", "m.youtube.com", "music.youtube.com":
		return resolveYouTubePath(segments, u.Query().Get("v"), input)

	default:
		return resolvedInput{}, fmt.Errorf("unrecognised YouTube URL: %s", input)
	}
}

func resolveYouTubePath(segments []string, videoParam string, input string) (resolvedInput, error) {
	if len(segments) == 0 {
		return resolvedInput{}, fmt.Errorf("no channel or video in YouTube URL: %s", input)
	}

	switch first := segments[0]; {
	case first == "watch":
		if videoParam == "" {
			return resolvedInput{}, fmt.Errorf("no video ID in YouTube URL: %s", input)
		}

		return resolvedInput{videoURL: watchURL(videoParam)}, nil

	case first == "live" || first == "shorts":
		if len(segments) < 2 {
			return resolvedInput{}, fmt.Errorf("no video ID in YouTube URL: %s", input)
		}

		return resolvedInput{videoURL: watchURL(segments[1])}, nil

	case first == "channel" || first == "c" || first == "user":
		if len(segments) < 2 {
			return resolvedInput{}, fmt.Errorf("no channel in YouTube URL: %s", input)
		}

		return channelLive("/" + first + "/" + segments[1]), nil

	default:
		return channelLive("/" + first), nil
	}
}

func channelLive(channelPath string) resolvedInput {
	return resolvedInput{liveURL: "https://www.youtube.com" + channelPath + "/live"}
}

// ResolveVideoURL normalises any user-provided YouTube input into a canonical
// https://www.youtube.com/watch?v={videoId} URL. A channel that is not live
// yields ErrChannelOffline.
//
// Accepted inputs: watch, youtu.be, /live/{videoId} and /shorts/{videoId} URLs,
// channel handle (@name), channel ID (UCxxxxxxx), or any channel/handle page URL
// (tabs such as /streams are ignored), on youtube.com, m.youtube.com or
// music.youtube.com.
func ResolveVideoURL(input string) (string, error) {
	r, err := resolveInput(input)
	if err != nil {
		return "", err
	}

	if !r.isChannel() {
		return r.videoURL, nil
	}

	return resolveLiveURL(context.Background(), httpClient, r.liveURL)
}

func watchURL(videoID string) string {
	return "https://www.youtube.com/watch?v=" + videoID
}

// isChannelID returns true if s looks like a raw YouTube channel ID (UC + 22 chars).
func isChannelID(s string) bool {
	return strings.HasPrefix(s, "UC") && len(s) == 24 && !strings.ContainsAny(s, "/ ?.")
}

// resolveLiveURL fetches a channel's /live page and returns the watch URL of the
// current stream, or ErrChannelOffline when the page canonicalises to the channel.
func resolveLiveURL(ctx context.Context, hc *http.Client, liveURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", liveURL, nil)
	if err != nil {
		return "", err
	}

	setBrowserHeaders(req)

	resp, err := hc.Do(req)
	if err != nil {
		if errors.Is(err, ErrRateLimited) {
			return "", ErrRateLimited
		}

		return "", fmt.Errorf("failed to fetch live page: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusTooManyRequests {
		return "", ErrRateLimited
	}

	if videoID := extractVideoID(resp.Request.URL.String()); videoID != "" {
		return watchURL(videoID), nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read live page body: %w", err)
	}

	return parseLivePage(string(body))
}

func parseLivePage(html string) (string, error) {
	tag := reCanonical.FindString(html)
	if tag == "" {
		return "", errors.New("canonical link not found on live page")
	}

	m := reHref.FindStringSubmatch(tag)
	if len(m) < 2 {
		return "", errors.New("canonical link has no href")
	}

	if videoID := extractVideoID(strings.ReplaceAll(m[1], "&amp;", "&")); videoID != "" {
		return watchURL(videoID), nil
	}

	return "", ErrChannelOffline
}

// extractVideoID returns the video ID from a youtube.com/watch?v=... URL, or "".
func extractVideoID(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return ""
	}
	if u.Path == "/watch" {
		return u.Query().Get("v")
	}
	return ""
}
