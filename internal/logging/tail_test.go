package logging

import (
	"os"
	"path/filepath"
	"testing"
)

func useDir(t *testing.T) string {
	t.Helper()

	dir := t.TempDir()
	setDir(t, dir)

	return dir
}

func writeLog(t *testing.T, dir, content string) {
	t.Helper()

	if err := os.WriteFile(filepath.Join(dir, FileName), []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
}

func TestTail(t *testing.T) {
	tests := []struct {
		name     string
		content  *string
		maxBytes int
		want     string
	}{
		{"missing file", nil, 100, ""},
		{"empty file", ptr(""), 100, ""},
		{"smaller than max", ptr("a\nb\n"), 100, "a\nb\n"},
		{"exact fit", ptr("a\nb\n"), 4, "a\nb\n"},
		{"cut mid-line", ptr("first\nsecond\nthird\n"), 10, "third\n"},
		{"cut at line start", ptr("first\nsecond\nthird\n"), 13, "second\nthird\n"},
		{"single line longer than max", ptr("abcdefghij\n"), 4, ""},
		{"zero max", ptr("a\n"), 0, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := useDir(t)

			if tt.content != nil {
				writeLog(t, dir, *tt.content)
			}

			got, err := Tail(tt.maxBytes)

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got != tt.want {
				t.Fatalf("got %q, want %q", got, tt.want)
			}
		})
	}
}

func ptr(s string) *string { return &s }

func setDir(t *testing.T, dir string) {
	t.Helper()

	previous := dirOverride
	dirOverride = dir

	t.Cleanup(func() { dirOverride = previous })
}
