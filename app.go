package main

import (
	"context"
	"fmt"
	"ghost-chat/internal/chat"
	"ghost-chat/internal/chat/twitch"
	"ghost-chat/internal/config"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx            context.Context
	config         *config.Config
	configPath     string
	twitch         *twitch.Client
	preExpandWidth int
}

func NewApp(cfg *config.Config, configPath string) *App {
	app := &App{
		config:     cfg,
		configPath: configPath,
	}

	app.twitch = twitch.NewClient(
		func(msg chat.ChatMessage) {
			wailsRuntime.EventsEmit(app.ctx, "chat:message", msg)
		},
		func(event string, data any) {
			wailsRuntime.EventsEmit(app.ctx, event, data)
		},
	)

	return app
}

func (a *App) onBeforeClose(ctx context.Context) bool {
	a.twitch.Disconnect()

	x, y := wailsRuntime.WindowGetPosition(a.ctx)
	w, h := wailsRuntime.WindowGetSize(a.ctx)

	a.config.WindowState.X = x
	a.config.WindowState.Y = y

	if a.preExpandWidth > 0 {
		a.config.WindowState.Width = a.preExpandWidth
	} else {
		a.config.WindowState.Width = w
	}
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

func (a *App) ConnectTwitch(channel string) error {
	return a.twitch.Connect(channel)
}

func (a *App) DisconnectTwitch() {
	a.twitch.Disconnect()
}

func (a *App) ExpandForSettings() {
	w, h := wailsRuntime.WindowGetSize(a.ctx)
	a.preExpandWidth = w
	wailsRuntime.WindowSetSize(a.ctx, 1000, h)
}

func (a *App) ShrinkToChat() {
	_, h := wailsRuntime.WindowGetSize(a.ctx)
	width := a.preExpandWidth
	if width == 0 {
		width = a.config.WindowState.Width
	}
	wailsRuntime.WindowSetSize(a.ctx, width, h)
}
