package main

import (
	"fmt"
	"ghost-chat/internal/bugreport"
	"ghost-chat/internal/config"
	"ghost-chat/internal/logging"
)

func (a *App) reporter() *bugreport.Reporter {
	return &bugreport.Reporter{
		Endpoint:  reportEndpoint,
		Version:   a.version,
		InstallID: a.installID,
		Platforms: a.platforms.Connected,
		Logs:      logging.Tail,
		OpenURL: func(url string) error {
			return a.app.Browser.OpenURL(url)
		},
	}
}

func (a *App) installID() (string, error) {
	a.configMu.Lock()
	defer a.configMu.Unlock()

	id, created, err := a.config.EnsureInstallID()

	if err != nil {
		return "", err
	}

	if created {
		if err := config.Save(a.config, a.configPath); err != nil {
			return "", fmt.Errorf("save config: %w", err)
		}
	}

	return id, nil
}

func (a *App) PreviewDiagnostics() (bugreport.Diagnostics, error) {
	return a.reporter().PreviewDiagnostics()
}

func (a *App) SubmitBugReport(report bugreport.Input) (bugreport.Result, error) {
	return a.reporter().Submit(report)
}
