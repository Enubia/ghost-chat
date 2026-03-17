package youtube

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

var reVideoID = regexp.MustCompile(`(?:"videoId"|watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})`)

// ResolveVideoURL normalises any user-provided YouTube input into a canonical
// https://www.youtube.com/watch?v={videoId} URL.
//
// Accepted inputs: full watch URL, youtu.be short URL, channel handle (@name),
// channel ID (UCxxxxxxx), or channel/handle URL.
func ResolveVideoURL(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("empty input")
	}

	// Bare @handle → full URL
	if strings.HasPrefix(input, "@") {
		input = "https://www.youtube.com/" + input
	}

	// Bare channel ID (UC + 22 alphanumeric chars)
	if isChannelID(input) {
		input = "https://www.youtube.com/channel/" + input
	}

	if !strings.Contains(input, "://") {
		input = "https://" + input
	}

	u, err := url.Parse(input)
	if err != nil {
		return "", fmt.Errorf("invalid input: %w", err)
	}

	switch u.Host {
	case "youtu.be":
		videoID := strings.TrimPrefix(u.Path, "/")
		if videoID == "" {
			return "", fmt.Errorf("no video ID in youtu.be URL")
		}
		return "https://www.youtube.com/watch?v=" + videoID, nil

	case "www.youtube.com", "youtube.com":
		if u.Path == "/watch" {
			if v := u.Query().Get("v"); v != "" {
				return "https://www.youtube.com/watch?v=" + v, nil
			}
		}
		// Channel or handle URL — resolve via /live redirect
		liveURL := "https://www.youtube.com" + u.Path
		if !strings.HasSuffix(liveURL, "/live") {
			liveURL += "/live"
		}
		return resolveLiveURL(liveURL)

	default:
		return "", fmt.Errorf("unrecognised YouTube URL: %s", input)
	}
}

// isChannelID returns true if s looks like a raw YouTube channel ID (UC + 22 chars).
func isChannelID(s string) bool {
	return strings.HasPrefix(s, "UC") && len(s) == 24 && !strings.ContainsAny(s, "/ ?.")
}

// resolveLiveURL fetches a /live page and extracts the live video ID.
// It first checks the final redirect URL (YouTube sometimes redirects to /watch?v=...),
// then falls back to scanning the page HTML for a videoId.
func resolveLiveURL(liveURL string) (string, error) {
	req, err := http.NewRequest("GET", liveURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", browserUA)

	resp, err := newHTTPClient().Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch live page: %w", err)
	}
	defer resp.Body.Close()

	// Check redirect URL first (fast path)
	if videoID := extractVideoID(resp.Request.URL.String()); videoID != "" {
		return "https://www.youtube.com/watch?v=" + videoID, nil
	}

	// YouTube often serves the live page at the same URL without redirecting.
	// Scan the HTML for the first videoId that appears near live-stream context.
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read live page body: %w", err)
	}

	if videoID := extractVideoIDFromHTML(string(body)); videoID != "" {
		return "https://www.youtube.com/watch?v=" + videoID, nil
	}

	return "", fmt.Errorf("no live stream found at %s", liveURL)
}

// extractVideoIDFromHTML scans HTML for the first YouTube video ID (11-char alphanumeric).
// Looks for patterns like "videoId":"XXXXXXXXXXX", watch?v=XXXXXXXXXXX, etc.
func extractVideoIDFromHTML(html string) string {
	match := reVideoID.FindStringSubmatch(html)
	if len(match) < 2 {
		return ""
	}
	return match[1]
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
