package auth

import (
	"errors"
	"testing"
	"time"

	"github.com/zalando/go-keyring"
)

func TestKeychainTokenStoreSaveAndLoad(t *testing.T) {
	keyring.MockInit()

	store := NewKeychainTokenStore()

	want := TokenSet{
		AccessToken:  "access-123",
		RefreshToken: "refresh-456",
		Expiry:       time.Now().Add(time.Hour).UTC(),
	}

	if err := store.Save(want); err != nil {
		t.Fatal(err)
	}

	got, err := store.Load()

	if err != nil {
		t.Fatal(err)
	}

	if got.AccessToken != want.AccessToken {
		t.Errorf("got %v, want %v", got.AccessToken, want.AccessToken)
	}

	if got.RefreshToken != want.RefreshToken {
		t.Errorf("got %v, want %v", got.RefreshToken, want.RefreshToken)
	}

	if !got.Expiry.Equal(want.Expiry) {
		t.Errorf("got %v, want %v", got.Expiry, want.Expiry)
	}
}

func TestKeychainTokenStoreLoadWhenEmptyReturnsErrNoToken(t *testing.T) {
	keyring.MockInit()

	store := NewKeychainTokenStore()

	_, err := store.Load()

	if !errors.Is(err, ErrNoToken) {
		t.Errorf("got %v, want %v", err, ErrNoToken)
	}
}

func TestKeychainTokenStoreClear(t *testing.T) {
	keyring.MockInit()

	store := NewKeychainTokenStore()

	if err := store.Save(TokenSet{AccessToken: "access-123"}); err != nil {
		t.Fatal(err)
	}

	if err := store.Clear(); err != nil {
		t.Fatal(err)
	}

	_, err := store.Load()

	if !errors.Is(err, ErrNoToken) {
		t.Errorf("got %v, want %v", err, ErrNoToken)
	}
}

func TestKeychainTokenStoreClearWhenEmptyIsNotAnError(t *testing.T) {
	keyring.MockInit()

	store := NewKeychainTokenStore()

	if err := store.Clear(); err != nil {
		t.Errorf("got %v, want nil", err)
	}
}
