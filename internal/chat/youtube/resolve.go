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

	switch u.Host {
	case "youtu.be":
		videoID := strings.TrimPrefix(u.Path, "/")
		if videoID == "" {
			return resolvedInput{}, fmt.Errorf("no video ID in youtu.be URL")
		}

		return resolvedInput{videoURL: "https://www.youtube.com/watch?v=" + videoID}, nil

	case "www.youtube.com", "youtube.com":
		if u.Path == "/watch" {
			if v := u.Query().Get("v"); v != "" {
				return resolvedInput{videoURL: "https://www.youtube.com/watch?v=" + v}, nil
			}
		}

		liveURL := "https://www.youtube.com" + u.Path
		if !strings.HasSuffix(liveURL, "/live") {
			liveURL += "/live"
		}

		return resolvedInput{liveURL: liveURL}, nil

	default:
		return resolvedInput{}, fmt.Errorf("unrecognised YouTube URL: %s", input)
	}
}

// ResolveVideoURL normalises any user-provided YouTube input into a canonical
// https://www.youtube.com/watch?v={videoId} URL. A channel that is not live
// yields ErrChannelOffline.
//
// Accepted inputs: full watch URL, youtu.be short URL, channel handle (@name),
// channel ID (UCxxxxxxx), or channel/handle URL.
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
		return "https://www.youtube.com/watch?v=" + videoID, nil
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
		return "", fmt.Errorf("canonical link not found on live page")
	}

	m := reHref.FindStringSubmatch(tag)
	if len(m) < 2 {
		return "", fmt.Errorf("canonical link has no href")
	}

	if videoID := extractVideoID(strings.ReplaceAll(m[1], "&amp;", "&")); videoID != "" {
		return "https://www.youtube.com/watch?v=" + videoID, nil
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
