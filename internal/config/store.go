package config

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

const (
	AppName        = "ghost-chat"
	ConfigFileName = "config.json"
)

func GetConfigPath() (string, error) {
	userConfigDir, err := os.UserConfigDir()

	if err != nil {
		return "", err
	}

	return filepath.Join(userConfigDir, AppName, ConfigFileName), nil
}

func Load(path string) (*Config, error) {
	bytes, err := os.ReadFile(path)

	if errors.Is(err, os.ErrNotExist) {
		defaultConfig := DefaultConfig()

		return &defaultConfig, nil
	}

	if err != nil {
		return nil, err
	}

	// Detect v3 config (camelCase keys like "savedWindowState", "options")
	// which doesn't match v4's snake_case struct tags. Discard and start fresh.
	var raw map[string]json.RawMessage

	if err = json.Unmarshal(bytes, &raw); err != nil {
		return recoverCorrupted(path, bytes, err)
	}

	if _, hasV3Key := raw["savedWindowState"]; hasV3Key {
		defaultConfig := DefaultConfig()

		return &defaultConfig, nil
	}

	config := DefaultConfig()

	if err = json.Unmarshal(bytes, &config); err != nil {
		return recoverCorrupted(path, bytes, err)
	}

	return &config, nil
}

func recoverCorrupted(path string, bytes []byte, err error) (*Config, error) {
	println("Warning: config file is corrupted, backing up and starting fresh:", err.Error())

	_ = os.WriteFile(path+".corrupted", bytes, 0644)
	_ = os.Remove(path)

	defaultConfig := DefaultConfig()

	return &defaultConfig, nil
}

func Save(config *Config, path string) error {
	bytes, err := json.MarshalIndent(config, "", "  ")

	if err != nil {
		return err
	}

	if err = os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	tempPath := path + ".tmp"

	f, err := os.OpenFile(tempPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)

	if err != nil {
		return err
	}

	defer func() {
		f.Close()

		_ = os.Remove(tempPath)
	}()

	if _, err = f.Write(bytes); err != nil {
		return err
	}

	if err = f.Sync(); err != nil {
		return err
	}

	if err = f.Close(); err != nil {
		return err
	}

	return os.Rename(tempPath, path)
}
