package logging

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRotatingFileRotatesPastLimit(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, FileName)

	w, err := newRotatingFile(path, 100, 3)

	if err != nil {
		t.Fatal(err)
	}

	defer w.Close()

	line := strings.Repeat("x", 49) + "\n"

	for range 7 {
		if _, err := w.Write([]byte(line)); err != nil {
			t.Fatal(err)
		}
	}

	for _, name := range []string{FileName, FileName + ".1", FileName + ".2"} {
		if _, err := os.Stat(filepath.Join(dir, name)); err != nil {
			t.Fatalf("expected %s: %v", name, err)
		}
	}

	if _, err := os.Stat(filepath.Join(dir, FileName+".3")); !os.IsNotExist(err) {
		t.Fatalf("expected no .3 file, got %v", err)
	}

	info, err := os.Stat(path)

	if err != nil {
		t.Fatal(err)
	}

	if info.Size() > 100 {
		t.Fatalf("current file %d bytes exceeds limit", info.Size())
	}
}

func TestRotatingFileAppendsToExisting(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, FileName)

	if err := os.WriteFile(path, []byte("old\n"), 0o600); err != nil {
		t.Fatal(err)
	}

	w, err := newRotatingFile(path, 100, 3)

	if err != nil {
		t.Fatal(err)
	}

	if _, err := w.Write([]byte("new\n")); err != nil {
		t.Fatal(err)
	}

	w.Close()

	got, err := os.ReadFile(path)

	if err != nil {
		t.Fatal(err)
	}

	if string(got) != "old\nnew\n" {
		t.Fatalf("got %q", got)
	}
}
