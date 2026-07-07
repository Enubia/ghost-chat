package main

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"ghost-chat/internal/auth"
	"ghost-chat/internal/chat/twitch"
)

type twitchAuthAdapter struct {
	m *auth.Manager
}

func (t twitchAuthAdapter) AccessToken(ctx context.Context) (string, error) {
	token, err := t.m.AccessToken(ctx)

	if errors.Is(err, auth.ErrInvalidGrant) {
		return "", twitch.ErrAuthPermanent
	}

	return token, err
}

func (t twitchAuthAdapter) UserID(ctx context.Context, token string) (string, error) {
	v, err := t.m.Validate(ctx, token)

	if err != nil {
		return "", err
	}

	return v.UserID, nil
}

func (t twitchAuthAdapter) Refresh(ctx context.Context) error {
	_, err := t.m.Refresh(ctx)

	if errors.Is(err, auth.ErrInvalidGrant) {
		return twitch.ErrAuthPermanent
	}

	return err
}

func (a *App) evaluateRedemptions() {
	a.redemptionsMu.Lock()
	defer a.redemptionsMu.Unlock()

	a.evaluateRedemptionsLocked()
}

func (a *App) evaluateRedemptionsLocked() {
	if a.redemptions == nil {
		return
	}

	should := twitch.ShouldRunRedemptions(a.auth.LoggedIn(), a.auth.CurrentLogin(), a.twitchChannel)

	if should {
		a.redemptions.Start()
	} else {
		a.redemptions.Stop()
	}
}

func (a *App) setTwitchChannel(channel string) {
	a.redemptionsMu.Lock()
	defer a.redemptionsMu.Unlock()

	a.twitchChannel = strings.ToLower(strings.TrimPrefix(strings.TrimSpace(channel), "#"))

	a.evaluateRedemptionsLocked()
}

func (a *App) clearTwitchChannel() {
	a.redemptionsMu.Lock()
	defer a.redemptionsMu.Unlock()

	a.twitchChannel = ""

	a.evaluateRedemptionsLocked()
}

func (a *App) handleRedemptionAuthLost() {
	a.redemptionsMu.Lock()

	if a.redemptions != nil {
		a.redemptions.Stop()
	}

	a.redemptionsMu.Unlock()

	if err := a.auth.Logout(context.Background()); err != nil {
		fmt.Printf("failed to log out after redemption auth loss: %s\n", err.Error())
	}

	if err := a.persistTwitchLogin(""); err != nil {
		fmt.Printf("failed to clear login after redemption auth loss: %s\n", err.Error())
	}

	a.emit("twitch:auth:loggedout", nil)

	a.evaluateRedemptions()
}
