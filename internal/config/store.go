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

	var config Config

	if err = json.Unmarshal(bytes, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func Save(config *Config, path string) error {
	bytes, err := json.MarshalIndent(config, "", "  ")

	if err != nil {
		return err
	}

	if err = os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	return os.WriteFile(path, bytes, 0644)
}
