package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/zalando/go-keyring"
)

const (
	keyringService = "ghost-chat"
	keyringUser    = "twitch"
)

var ErrNoToken = errors.New("no token stored")

type TokenSet struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	Expiry       time.Time `json:"expiry"`
}

type TokenStore interface {
	Save(tokens TokenSet) error
	Load() (TokenSet, error)
	Clear() error
}

type KeychainTokenStore struct{}

func NewKeychainTokenStore() *KeychainTokenStore {
	return &KeychainTokenStore{}
}

func (s *KeychainTokenStore) Save(tokens TokenSet) error {
	bytes, err := json.Marshal(tokens)

	if err != nil {
		return fmt.Errorf("marshal token set: %w", err)
	}

	if err = keyring.Set(keyringService, keyringUser, string(bytes)); err != nil {
		return fmt.Errorf("save token set to keychain: %w", err)
	}

	return nil
}

func (s *KeychainTokenStore) Load() (TokenSet, error) {
	value, err := keyring.Get(keyringService, keyringUser)

	if errors.Is(err, keyring.ErrNotFound) {
		return TokenSet{}, ErrNoToken
	}

	if err != nil {
		return TokenSet{}, fmt.Errorf("load token set from keychain: %w", err)
	}

	var tokens TokenSet

	if err = json.Unmarshal([]byte(value), &tokens); err != nil {
		return TokenSet{}, fmt.Errorf("unmarshal token set: %w", err)
	}

	return tokens, nil
}

func (s *KeychainTokenStore) Clear() error {
	err := keyring.Delete(keyringService, keyringUser)

	if err != nil && !errors.Is(err, keyring.ErrNotFound) {
		return fmt.Errorf("clear token set from keychain: %w", err)
	}

	return nil
}
