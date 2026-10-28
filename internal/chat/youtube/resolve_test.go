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
	for _, in := range []string{"@MrBeast", "UCX6OQ3DkcsbYNE6H8uQQuVA", "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA", "youtube.com/@x/live"} {
		r, err := resolveInput(in)
		if err != nil || !r.isChannel() {
			t.Errorf("%q: got %+v, %v; want channel", in, r, err)
		}
	}

	for _, in := range []string{"https://www.youtube.com/watch?v=abc", "https://youtu.be/abc"} {
		r, err := resolveInput(in)
		if err != nil || r.isChannel() || r.videoURL != "https://www.youtube.com/watch?v=abc" {
			t.Errorf("%q: got %+v, %v; want video", in, r, err)
		}
	}
}
