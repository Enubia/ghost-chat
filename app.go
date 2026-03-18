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
	"ghost-chat/internal/updater"
	"os/exec"
	"path/filepath"
	"runtime"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

type App struct {
	app            *application.App
	window         *application.WebviewWindow
	config         *config.Config
	configPath     string
	twitch         *twitch.Client
	youtube        *youtube.Client
	kick           *kick.Client
	version        string
	preExpandWidth int
	vanished       bool
	lastX, lastY   int
	lastW, lastH   int
}

func NewApp(cfg *config.Config, configPath string, version string) *App {
	return &App{
		config:     cfg,
		configPath: configPath,
		version:    version,
		lastX:      cfg.WindowState.X,
		lastY:      cfg.WindowState.Y,
		lastW:      cfg.WindowState.Width,
		lastH:      cfg.WindowState.Height,
	}
}

func (a *App) SetApp(app *application.App, win *application.WebviewWindow) {
	a.app = app
	a.window = win

	onMessage := func(msg chat.ChatMessage) {
		a.app.Event.Emit("chat:message", msg)
	}
	onEvent := func(event string, data any) {
		a.app.Event.Emit(event, data)
	}

	a.twitch = twitch.NewClient(onMessage, onEvent)
	a.youtube = youtube.NewClient(onMessage, onEvent)
	a.kick = kick.NewClient(onMessage, onEvent)
}

func (a *App) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	a.window.OnWindowEvent(events.Common.WindowRuntimeReady, func(e *application.WindowEvent) {
		if a.config.WindowState.X != 0 || a.config.WindowState.Y != 0 {
			a.window.SetPosition(a.config.WindowState.X, a.config.WindowState.Y)
		}

		a.window.Show()

		go func() {
			info, err := updater.CheckForUpdate(a.version)

			if err != nil || info == nil {
				return
			}

			a.app.Event.Emit("update:available", info)
		}()
	})

	a.window.OnWindowEvent(events.Common.WindowDidMove, func(e *application.WindowEvent) {
		a.lastX, a.lastY = a.window.Position()
	})

	a.window.OnWindowEvent(events.Common.WindowDidResize, func(e *application.WindowEvent) {
		a.lastW, a.lastH = a.window.Size()
	})

	go func() {
		if keybind := a.config.Keybinds.Vanish.Keybind; keybind != "" {
			if err := ghHotkey.Register(keybind, a.ToggleVanish); err != nil {
				fmt.Printf("failed to register vanish hotkey: %s\n", err.Error())
			}
		}
	}()

	return nil
}

func (a *App) SaveWindowState() {
	a.config.WindowState.X = a.lastX
	a.config.WindowState.Y = a.lastY

	if a.preExpandWidth > 0 {
		a.config.WindowState.Width = a.preExpandWidth
	} else {
		a.config.WindowState.Width = a.lastW
	}

	a.config.WindowState.Height = a.lastH

	if err := config.Save(a.config, a.configPath); err != nil {
		fmt.Printf("failed to save config: %s\n", err.Error())
	}
}

func (a *App) ServiceShutdown() error {
	go func() {
		a.twitch.Disconnect()
		a.youtube.Disconnect()
		a.kick.Disconnect()
		ghHotkey.Unregister()
	}()

	return nil
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
	w, h := a.window.Size()
	a.preExpandWidth = w

	a.window.SetSize(1000, h)
}

func (a *App) ShrinkToChat() {
	_, h := a.window.Size()
	width := a.preExpandWidth

	if width == 0 {
		width = a.config.WindowState.Width
	}

	a.window.SetSize(width, h)
}

func (a *App) ToggleVanish() {
	a.vanished = !a.vanished

	a.app.Event.Emit("vanish:toggle", a.vanished)

	if a.vanished {
		a.window.SetIgnoreMouseEvents(true)
	} else {
		a.window.SetIgnoreMouseEvents(false)
	}
}

func (a *App) OpenConfigFolder() {
	dir := filepath.Dir(a.configPath)

	switch runtime.GOOS {
	case "darwin":
		exec.Command("open", dir).Start()
	case "windows":
		exec.Command("explorer", dir).Start()
	}
}
