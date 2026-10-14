package config

import (
	"path/filepath"
	"regexp"
	"testing"
)

var uuidV4Re = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

func TestEnsureInstallIDGeneratesUUIDv4Once(t *testing.T) {
	cfg := DefaultConfig()

	id, created, err := cfg.EnsureInstallID()

	if err != nil || !created || !uuidV4Re.MatchString(id) {
		t.Fatalf("got %q created=%v err=%v", id, created, err)
	}

	again, created, _ := cfg.EnsureInstallID()

	if created || again != id {
		t.Fatalf("not stable: %q vs %q", again, id)
	}
}

func TestInstallIDStableAcrossRestarts(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.json")

	first, _ := Load(path)
	id, _, _ := first.EnsureInstallID()

	if err := Save(first, path); err != nil {
		t.Fatal(err)
	}

	second, err := Load(path)

	if err != nil {
		t.Fatal(err)
	}

	got, created, _ := second.EnsureInstallID()

	if created || got != id {
		t.Fatalf("got %q want %q", got, id)
	}
}
