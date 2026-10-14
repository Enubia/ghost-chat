package bugreport

import (
	"slices"
	"testing"
)

func TestPlatformTracker(t *testing.T) {
	var tr PlatformTracker

	if got := tr.Connected(); got == nil || len(got) != 0 {
		t.Fatalf("got %v", got)
	}

	tr.Observe("chat:connected", map[string]string{"platform": "twitch"})
	tr.Observe("chat:connected", map[string]string{"platform": "kick"})
	tr.Observe("chat:message", "x")
	tr.Observe("chat:disconnected", map[string]string{"platform": "twitch"})

	if got := tr.Connected(); !slices.Equal(got, []string{"kick"}) {
		t.Fatalf("got %v", got)
	}
}
