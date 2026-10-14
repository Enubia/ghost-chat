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

func writeRotated(t *testing.T, dir, content string) {
	t.Helper()

	if err := os.WriteFile(filepath.Join(dir, FileName+".1"), []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
}

func TestTailFillsFromRotatedFile(t *testing.T) {
	tests := []struct {
		name     string
		rotated  string
		current  string
		maxBytes int
		want     string
	}{
		{"fills remainder", "old1\nold2\n", "new\n", 100, "old1\nold2\nnew\n"},
		{"cuts rotated at line boundary", "old1\nold2\nold3\n", "new\n", 13, "old3\nnew\n"},
		{"rotated line boundary exact", "old1\nold2\n", "new\n", 14, "old1\nold2\nnew\n"},
		{"current fills max", "old\n", "new1\nnew2\n", 10, "new1\nnew2\n"},
		{"empty current", "old1\nold2\n", "", 100, "old1\nold2\n"},
		{"oversize rotated line", "oldoldold\n", "new\n", 8, "new\n"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := useDir(t)
			writeRotated(t, dir, tt.rotated)
			writeLog(t, dir, tt.current)

			got, err := Tail(tt.maxBytes)

			if err != nil {
				t.Fatal(err)
			}

			if got != tt.want {
				t.Fatalf("got %q want %q", got, tt.want)
			}

			if len(got) > tt.maxBytes {
				t.Fatalf("got %d bytes, max %d", len(got), tt.maxBytes)
			}
		})
	}
}

func TestTailRotatedOnly(t *testing.T) {
	dir := useDir(t)
	writeRotated(t, dir, "old\n")

	got, err := Tail(100)

	if err != nil {
		t.Fatal(err)
	}

	if got != "old\n" {
		t.Fatalf("got %q", got)
	}
}
