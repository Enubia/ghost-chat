package twitch

import (
	"testing"

	"ghost-chat/internal/chat"
)

func TestResolveEmotes_SetsEmoteKindAndKeepsExisting(t *testing.T) {
	store := NewEmoteStore()
	store.store(map[string]string{"peepoG": "https://cdn.example.com/peepoG.png"})

	existing := []chat.Entity{
		{ID: "g1", Start: 0, End: 4, URL: "https://example.com/x.gif", Kind: chat.FragmentGif},
	}

	got := store.ResolveEmotes("[gif] peepoG hi", existing)

	want := []chat.Entity{
		{ID: "g1", Start: 0, End: 4, URL: "https://example.com/x.gif", Kind: chat.FragmentGif},
		{ID: "peepoG", Start: 6, End: 11, URL: "https://cdn.example.com/peepoG.png", Kind: chat.FragmentEmote},
	}

	if len(got) != len(want) {
		t.Fatalf("len = %d, want %d: %+v", len(got), len(want), got)
	}

	for i := range want {
		if got[i] != want[i] {
			t.Errorf("got[%d] = %+v, want %+v", i, got[i], want[i])
		}
	}
}
