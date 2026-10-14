package config

import (
	"crypto/rand"
	"fmt"
)

func (c *Config) EnsureInstallID() (string, bool, error) {
	if c.InstallID != "" {
		return c.InstallID, false, nil
	}

	id, err := newUUIDv4()

	if err != nil {
		return "", false, err
	}

	c.InstallID = id

	return id, true, nil
}

func newUUIDv4() (string, error) {
	var b [16]byte

	if _, err := rand.Read(b[:]); err != nil {
		return "", fmt.Errorf("generate install id: %w", err)
	}

	b[6] = b[6]&0x0f | 0x40
	b[8] = b[8]&0x3f | 0x80

	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:]), nil
}
