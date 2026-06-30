package config

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestCustomSourceRoundTrip(t *testing.T) {
	const rawURL = "https://example.com/overlay?token=abc#frag"

	cfg := DefaultConfig()
	cfg.CustomSource = CustomSource{URL: rawURL}

	data, err := json.Marshal(cfg)

	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	want := `"custom_source":{"url":"https://example.com/overlay?token=abc#frag"}`

	if !strings.Contains(string(data), want) {
		t.Errorf("marshaled JSON does not contain %q; got: %s", want, data)
	}

	var got Config

	if err := json.Unmarshal(data, &got); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	if got.CustomSource.URL != rawURL {
		t.Errorf("got URL %q, want %q", got.CustomSource.URL, rawURL)
	}
}

func TestCustomSourceBackwardCompat(t *testing.T) {
	data := []byte(`{"version":"4.0.2","general":{"language":"en-US","show_timestamps":false,"show_waiting_message":true}}`)

	var cfg Config

	if err := json.Unmarshal(data, &cfg); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	if cfg.CustomSource.URL != "" {
		t.Errorf("got URL %q, want empty string", cfg.CustomSource.URL)
	}
}
