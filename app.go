package main

import (
	"context"
	"fmt"
	"ghost-chat/internal/chat"
	"ghost-chat/internal/chat/kick"
	"ghost-chat/internal/chat/twitch"
	"ghost-chat/internal/chat/youtube"
	"ghost-chat/internal/config"
	ghHotkey "ghost-chat/internal/hotkey"
	"ghost-chat/internal/tray"
	"os/exec"
	"path/filepath"
	"runtime"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx            context.Context
	config         *config.Config
	configPath     string
	twitch         *twitch.Client
	youtube        *youtube.Client
	kick           *kick.Client
	preExpandWidth int
	vanished       bool
	trayIcon       []byte
}

func NewApp(cfg *config.Config, configPath string, trayIcon []byte) *App {
	app := &App{
		config:     cfg,
		configPath: configPath,
		trayIcon:   trayIcon,
	}

	onMessage := func(msg chat.ChatMessage) {
		wailsRuntime.EventsEmit(app.ctx, "chat:message", msg)
	}
	onEvent := func(event string, data any) {
		wailsRuntime.EventsEmit(app.ctx, event, data)
	}

	app.twitch = twitch.NewClient(onMessage, onEvent)
	app.youtube = youtube.NewClient(onMessage, onEvent)
	app.kick = kick.NewClient(onMessage, onEvent)

	tray.Init(cfg.Version, trayIcon, tray.Callbacks{
		OnToggleVanish: func() { app.ToggleVanish() },
		OnOpenConfig:   func() { app.OpenConfigFolder() },
		OnQuit: func() {
			if app.ctx != nil {
				wailsRuntime.Quit(app.ctx)
			}
		},
	})

	return app
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	if a.config.WindowState.X != 0 || a.config.WindowState.Y != 0 {
		wailsRuntime.WindowSetPosition(a.ctx, a.config.WindowState.X, a.config.WindowState.Y)
	}

	wailsRuntime.WindowShow(a.ctx)

	tray.Start(a.config.Version, a.trayIcon)

	if keybind := a.config.Keybinds.Vanish.Keybind; keybind != "" {
		if err := ghHotkey.Register(keybind, a.ToggleVanish); err != nil {
			fmt.Printf("failed to register vanish hotkey: %s\n", err.Error())
		}
	}
}

func (a *App) onBeforeClose(ctx context.Context) bool {
	a.twitch.Disconnect()
	a.youtube.Disconnect()
	a.kick.Disconnect()

	ghHotkey.Unregister()
	tray.Stop()

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

func (a *App) GetConfig() *config.Config {
	return a.config
}

func (a *App) UpdateConfig(cfg *config.Config) error {
	oldConfig := a.config
	oldKeybind := a.config.Keybinds.Vanish.Keybind

	a.config = cfg

	if err := config.Save(a.config, a.configPath); err != nil {
		a.config = oldConfig
		return err
	}

	if cfg.Keybinds.Vanish.Keybind != oldKeybind {
		if err := ghHotkey.Register(cfg.Keybinds.Vanish.Keybind, a.ToggleVanish); err != nil {
			fmt.Printf("failed to register vanish hotkey: %s\n", err.Error())
		}
	}

	return nil
}

func (a *App) ConnectTwitch(channel string) error {
	return a.twitch.Connect(channel)
}

func (a *App) DisconnectTwitch() {
	a.twitch.Disconnect()
}

func (a *App) ConnectYouTube(input string) error {
	return a.youtube.Connect(input)
}

func (a *App) DisconnectYouTube() {
	a.youtube.Disconnect()
}

func (a *App) ResolveYouTubeVideo(input string) (string, error) {
	return youtube.ResolveVideoURL(input)
}

func (a *App) ConnectKick(input string) error {
	return a.kick.Connect(input)
}

func (a *App) DisconnectKick() {
	a.kick.Disconnect()
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

func (a *App) ToggleVanish() {
	a.vanished = !a.vanished

	wailsRuntime.EventsEmit(a.ctx, "vanish:toggle", a.vanished)
}

func (a *App) OpenConfigFolder() {
	dir := filepath.Dir(a.configPath)

	switch runtime.GOOS {
	case "darwin":
		exec.Command("open", dir).Start()
	case "linux":
		exec.Command("xdg-open", dir).Start()
	case "windows":
		exec.Command("explorer", dir).Start()
	}
}
