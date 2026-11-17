package youtube

import (
	"errors"
	"testing"
)

func TestParseLivePage(t *testing.T) {
	tests := []struct {
		name    string
		html    string
		want    string
		wantErr error
		anyErr  bool
	}{
		{
			name: "live canonical",
			html: `<html><head><link rel="canonical" href="https://www.youtube.com/watch?v=0sfDth4lMLc"></head></html>`,
			want: "https://www.youtube.com/watch?v=0sfDth4lMLc",
		},
		{
			name:    "offline canonical",
			html:    `<html><head><link rel="canonical" href="https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA"></head><script>{"videoId":"aaaaaaaaaaa"}</script></html>`,
			wantErr: ErrChannelOffline,
		},
		{
			name:   "no canonical",
			html:   `<html><script>{"videoId":"aaaaaaaaaaa"}</script></html>`,
			anyErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parseLivePage(tt.html)
			if tt.anyErr {
				if err == nil || errors.Is(err, ErrChannelOffline) {
					t.Fatalf("err = %v, want non-offline error", err)
				}

				return
			}

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("err = %v, want %v", err, tt.wantErr)
			}

			if got != tt.want {
				t.Errorf("got %q, want %q", got, tt.want)
			}
		})
	}
}

func TestResolveInputKinds(t *testing.T) {
	for _, in := range []string{
		"@MrBeast",
		"UCX6OQ3DkcsbYNE6H8uQQuVA",
		"https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA",
		"youtube.com/@x/live",
		"https://m.youtube.com/@x",
	} {
		r, err := resolveInput(in)
		if err != nil || !r.isChannel() {
			t.Errorf("%q: got %+v, %v; want channel", in, r, err)
		}
	}

	for _, in := range []string{
		"https://www.youtube.com/watch?v=abc",
		"https://youtu.be/abc",
		"https://www.youtube.com/live/abc",
		"https://youtube.com/live/abc?si=share",
		"https://m.youtube.com/watch?v=abc",
		"m.youtube.com/live/abc",
		"https://www.youtube.com/live/abc/",
		"https://www.youtube.com/shorts/abc",
		"https://music.youtube.com/watch?v=abc",
		"https://WWW.YOUTUBE.COM/watch?v=abc",
		"https://YOUTU.BE/abc",
		"https://youtu.be/abc/",
	} {
		r, err := resolveInput(in)
		if err != nil || r.isChannel() || r.videoURL != "https://www.youtube.com/watch?v=abc" {
			t.Errorf("%q: got %+v, %v; want video", in, r, err)
		}
	}
}

func TestResolveInputChannelLiveURL(t *testing.T) {
	tests := map[string]string{
		"https://www.youtube.com/@x/":                                     "https://www.youtube.com/@x/live",
		"https://www.youtube.com/@x/streams":                              "https://www.youtube.com/@x/live",
		"youtube.com/@x/featured":                                         "https://www.youtube.com/@x/live",
		"https://YouTube.com/@x":                                          "https://www.youtube.com/@x/live",
		"https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA/videos": "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA/live",
		"https://www.youtube.com/c/Name/live":                             "https://www.youtube.com/c/Name/live",
		"https://www.youtube.com/user/Name/streams":                       "https://www.youtube.com/user/Name/live",
		"https://www.youtube.com/LegacyName":                              "https://www.youtube.com/LegacyName/live",
	}

	for in, want := range tests {
		r, err := resolveInput(in)
		if err != nil || r.liveURL != want {
			t.Errorf("%q: got %+v, %v; want %s", in, r, err, want)
		}
	}
}

func TestResolveInputRejectsNonChannelPaths(t *testing.T) {
	for _, in := range []string{
		"https://www.youtube.com/",
		"https://www.youtube.com/live",
		"https://www.youtube.com/watch",
		"https://www.youtube.com/shorts/",
		"https://www.youtube.com/channel/",
		"https://youtu.be/",
		"https://example.com/@x",
	} {
		if r, err := resolveInput(in); err == nil {
			t.Errorf("%q: got %+v; want error", in, r)
		}
	}
}
