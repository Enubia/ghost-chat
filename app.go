package main

import (
	"context"
	"fmt"
	"ghost-chat/internal/config"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx        context.Context
	config     *config.Config
	configPath string
}

func NewApp(cfg *config.Config, configPath string) *App {
	return &App{
		config:     cfg,
		configPath: configPath,
	}
}

func (a *App) onBeforeClose(ctx context.Context) bool {
	x, y := wailsRuntime.WindowGetPosition(a.ctx)
	w, h := wailsRuntime.WindowGetSize(a.ctx)

	a.config.WindowState.X = x
	a.config.WindowState.Y = y
	a.config.WindowState.Width = w
	a.config.WindowState.Height = h

	if err := config.Save(a.config, a.configPath); err != nil {
		fmt.Printf("failed to save config on close: %s\n", err.Error())
	}

	return false
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	if a.config.WindowState.X != 0 || a.config.WindowState.Y != 0 {
		wailsRuntime.WindowSetPosition(a.ctx, a.config.WindowState.X, a.config.WindowState.Y)
	}

	wailsRuntime.WindowShow(a.ctx)

	wailsRuntime.EventsOn(a.ctx, "test:from-frontend", func(optionalData ...any) {
		fmt.Println(optionalData)
	})
}

func (a *App) GetConfig() *config.Config {
	return a.config
}

func (a *App) UpdateConfig(cfg *config.Config) error {
	oldConfig := a.config

	a.config = cfg

	if err := config.Save(a.config, a.configPath); err != nil {
		a.config = oldConfig
		return err
	}

	return nil
}

func (a *App) ExpandForSettings() {
	_, h := wailsRuntime.WindowGetSize(a.ctx)
	wailsRuntime.WindowSetSize(a.ctx, 1000, h)
}

func (a *App) ShrinkToChat() {
	_, h := wailsRuntime.WindowGetSize(a.ctx)
	wailsRuntime.WindowSetSize(a.ctx, a.config.WindowState.Width, h)
}
