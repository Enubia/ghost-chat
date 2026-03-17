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

func TestLoadReturnsErrorForInvalidJSON(t *testing.T) {
	tmpDir := t.TempDir()

	path := filepath.Join(tmpDir, "ghost-chat", "config.json")

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		t.Fatal("Failed to create tmp dir", err)
	}

	if err := os.WriteFile(path, []byte("not json"), 0644); err != nil {
		t.Fatal("Failed to write garbage data", err)
	}

	config, err := Load(path)

	if err == nil {
		t.Error("Expected error for invalid JSON, got nil")
	}

	if config != nil {
		t.Error("Expected nil config, got", config)
	}
}
