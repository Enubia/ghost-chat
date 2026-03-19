package config

import (
	"testing"
)

func TestAppliesMigration(t *testing.T) {
	cfg := DefaultConfig()
	cfg.Version = "1.0.0"

	migs := []Migration{
		{Version: "1.1.0", Migrate: func(cfg *Config) {
			cfg.General.Language = "de-DE"
		}},
	}

	err := runMigrations(&cfg, migs, "2.0.0")

	if err != nil {
		t.Fatal(err)
	}

	if cfg.Version != "1.1.0" {
		t.Errorf("got version %s, want 1.1.0", cfg.Version)
	}

	if cfg.General.Language != "de-DE" {
		t.Errorf("got language %s, want de-DE", cfg.General.Language)
	}
}

func TestSkipsMigration(t *testing.T) {
	cfg := DefaultConfig()
	cfg.Version = "1.1.0"

	migs := []Migration{
		{Version: "1.0.0", Migrate: func(cfg *Config) {
			cfg.General.Language = "de-DE"
		}},
	}

	err := runMigrations(&cfg, migs, "2.0.0")

	if err != nil {
		t.Fatal(err)
	}

	if cfg.Version != "1.1.0" {
		t.Errorf("got version %s, want 1.1.0", cfg.Version)
	}

	if cfg.General.Language == "de-DE" {
		t.Errorf("got language %s, want not de-DE", cfg.General.Language)
	}
}

func TestAppliesMultipleMigrations(t *testing.T) {
	cfg := DefaultConfig()
	cfg.Version = "1.0.0"

	migs := []Migration{
		{Version: "1.1.0", Migrate: func(cfg *Config) {}},
		{Version: "1.2.0", Migrate: func(cfg *Config) {}},
	}

	err := runMigrations(&cfg, migs, "2.0.0")

	if err != nil {
		t.Fatal(err)
	}

	if cfg.Version != "1.2.0" {
		t.Errorf("got version %s, want 1.2.0", cfg.Version)
	}
}

func TestThrowsErrorOnInvalidVersion(t *testing.T) {
	cfg := DefaultConfig()
	cfg.Version = "invalid"

	migs := []Migration{
		{Version: "1.1.0", Migrate: func(cfg *Config) {}},
	}

	err := runMigrations(&cfg, migs, "2.0.0")

	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestShowWaitingMessageMigration(t *testing.T) {
	cfg := DefaultConfig()
	cfg.Version = "4.0.1"
	cfg.General.ShowWaitingMessage = false

	err := RunMigrations(&cfg, "4.0.2")

	if err != nil {
		t.Fatal(err)
	}

	if !cfg.General.ShowWaitingMessage {
		t.Error("expected ShowWaitingMessage to be true after migration")
	}

	if cfg.Version != "4.0.2" {
		t.Errorf("got version %s, want 4.0.2", cfg.Version)
	}
}

func TestSkipsMigrationsNewerThanTarget(t *testing.T) {
	cfg := DefaultConfig()
	cfg.Version = "1.0.0"

	migs := []Migration{
		{Version: "3.0.0", Migrate: func(cfg *Config) {}},
	}

	err := runMigrations(&cfg, migs, "2.0.0")

	if err != nil {
		t.Fatal(err)
	}

	if cfg.Version != "1.0.0" {
		t.Errorf("got version %s, want 1.0.0", cfg.Version)
	}
}
