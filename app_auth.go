package main

import (
	"context"
	"errors"
	"fmt"

	"ghost-chat/internal/auth"
	"ghost-chat/internal/config"
)

type TwitchAuthStatus struct {
	LoggedIn bool   `json:"loggedIn"`
	Login    string `json:"login"`
}

type authPendingData struct {
	UserCode        string `json:"userCode"`
	VerificationURI string `json:"verificationUri"`
	ExpiresIn       int    `json:"expiresIn"`
}

type authSuccessData struct {
	Login string `json:"login"`
}

type authErrorData struct {
	Reason string `json:"reason"`
}

func (a *App) persistTwitchLogin(login string) error {
	a.configMu.Lock()
	defer a.configMu.Unlock()

	if a.config.Twitch.Account.Login == login {
		return nil
	}

	a.config.Twitch.Account.Login = login

	return config.Save(a.config, a.configPath)
}

func (a *App) TwitchAuthStatus() (TwitchAuthStatus, error) {
	return TwitchAuthStatus{
		LoggedIn: a.auth.LoggedIn(),
		Login:    a.auth.CurrentLogin(),
	}, nil
}

func (a *App) TwitchStartLogin() error {
	a.authMu.Lock()

	if a.authLoginPending {
		a.authMu.Unlock()

		return nil
	}

	a.authLoginPending = true

	a.authMu.Unlock()

	dc, err := a.auth.RequestDeviceCode(context.Background())

	if err != nil {
		a.clearAuthLoginPending()

		return fmt.Errorf("start twitch login: %w", err)
	}

	a.emit("twitch:auth:pending", authPendingData{
		UserCode:        dc.UserCode,
		VerificationURI: dc.VerificationURI,
		ExpiresIn:       dc.ExpiresIn,
	})

	go func() {
		defer a.clearAuthLoginPending()

		login, err := a.auth.CompleteDeviceLogin(context.Background(), dc)

		if err != nil {
			a.emit("twitch:auth:error", authErrorData{Reason: err.Error()})

			return
		}

		if err := a.persistTwitchLogin(login); err != nil {
			fmt.Printf("failed to save config after login: %s\n", err.Error())
		}

		a.emit("twitch:auth:success", authSuccessData{Login: login})

		a.evaluateRedemptions()
	}()

	return nil
}

func (a *App) clearAuthLoginPending() {
	a.authMu.Lock()
	defer a.authMu.Unlock()

	a.authLoginPending = false
}

func (a *App) TwitchLogout() error {
	if err := a.auth.Logout(context.Background()); err != nil {
		return fmt.Errorf("twitch logout: %w", err)
	}

	if err := a.persistTwitchLogin(""); err != nil {
		return fmt.Errorf("save config after logout: %w", err)
	}

	a.emit("twitch:auth:loggedout", nil)

	a.evaluateRedemptions()

	return nil
}

func (a *App) restoreTwitchAuth() {
	login, err := a.auth.Restore(context.Background())

	if errors.Is(err, auth.ErrNoToken) {
		return
	}

	if errors.Is(err, auth.ErrInvalidGrant) {
		if saveErr := a.persistTwitchLogin(""); saveErr != nil {
			fmt.Printf("failed to clear login after invalid grant: %s\n", saveErr.Error())
		}

		a.emit("twitch:auth:loggedout", nil)

		return
	}

	if err != nil {
		return
	}

	if saveErr := a.persistTwitchLogin(login); saveErr != nil {
		fmt.Printf("failed to persist restored login: %s\n", saveErr.Error())
	}

	a.emit("twitch:auth:success", authSuccessData{Login: login})

	a.evaluateRedemptions()
}
