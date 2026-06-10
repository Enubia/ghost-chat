package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadReturnsDefaultsWhenMissing(t *testing.T) {
	tmpDir := t.TempDir()

	path := filepath.Join(tmpDir, "ghost-chat", "config.json")

	config, err := Load(path)

	if err != nil {
		t.Fatal(err)
	}

	defaultConfig := DefaultConfig()

	if config.General.Language != defaultConfig.General.Language {
		t.Errorf("got %v, want %v", config.General.Language, defaultConfig.General.Language)
	}

	if config.WindowState.Width != defaultConfig.WindowState.Width {
		t.Errorf("got %v, want %v", config.WindowState.Width, defaultConfig.WindowState.Width)
	}

	if config.YouTube.FadeTimeout != defaultConfig.YouTube.FadeTimeout {
		t.Errorf("got %v, want %v", config.YouTube.FadeTimeout, defaultConfig.YouTube.FadeTimeout)
	}
}

func TestSaveAndLoad(t *testing.T) {
	tmpDir := t.TempDir()

	path := filepath.Join(tmpDir, "ghost-chat", "config.json")

	defaultConfig := DefaultConfig()

	defaultConfig.General.Language = "de-DE"
	defaultConfig.Twitch.DefaultChannel = "enubia"

	if err := Save(&defaultConfig, path); err != nil {
		t.Fatal("Failed to save config file", err)
	}

	config, err := Load(path)

	if err != nil {
		t.Fatal("Failed to load config", err)
	}

	if config.General.Language != defaultConfig.General.Language {
		t.Errorf("got %v, want %v", config.General.Language, defaultConfig.General.Language)
	}

	if config.Twitch.DefaultChannel != defaultConfig.Twitch.DefaultChannel {
		t.Errorf("got %v, want %v", config.Twitch.DefaultChannel, defaultConfig.Twitch.DefaultChannel)
	}
}

func TestLoadRecoversFromInvalidJSON(t *testing.T) {
	tmpDir := t.TempDir()

	path := filepath.Join(tmpDir, "ghost-chat", "config.json")

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		t.Fatal("Failed to create tmp dir", err)
	}

	garbageBytes := []byte("not json")

	if err := os.WriteFile(path, garbageBytes, 0644); err != nil {
		t.Fatal("Failed to write garbage data", err)
	}

	config, err := Load(path)

	if err != nil {
		t.Fatal("Expected nil error for invalid JSON, got", err)
	}

	if config == nil {
		t.Fatal("Expected default config, got nil")
	}

	defaultConfig := DefaultConfig()

	if config.General.Language != defaultConfig.General.Language {
		t.Errorf("got %v, want %v", config.General.Language, defaultConfig.General.Language)
	}

	backupBytes, err := os.ReadFile(path + ".corrupted")

	if err != nil {
		t.Fatal("Expected corrupted backup file to exist, got", err)
	}

	if string(backupBytes) != string(garbageBytes) {
		t.Errorf("got backup bytes %q, want %q", backupBytes, garbageBytes)
	}

	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Errorf("Expected corrupted file at %s to be removed, but it still exists", path)
	}
}
