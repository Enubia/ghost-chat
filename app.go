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
	clients        map[chat.Platform]chat.Client
	emit           func(event string, data any)
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

	a.emit = func(event string, data any) {
		a.app.Event.Emit(event, data)
	}

	a.wireClients()
}

func makeHandlers(emit func(string, any)) (func(chat.ChatMessage), func(string, any)) {
	onMessage := func(msg chat.ChatMessage) {
		emit("chat:message", msg)
	}
	onEvent := func(event string, data any) {
		emit(event, data)
	}

	return onMessage, onEvent
}

func (a *App) wireClients() {
	onMessage, onEvent := makeHandlers(a.emit)

	a.clients = map[chat.Platform]chat.Client{
		chat.PlatformTwitch:  twitch.NewClient(onMessage, onEvent),
		chat.PlatformYouTube: youtube.NewClient(onMessage, onEvent),
		chat.PlatformKick:    kick.NewClient(onMessage, onEvent),
	}
}

func (a *App) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	a.window.OnWindowEvent(events.Common.WindowRuntimeReady, func(e *application.WindowEvent) {
		w, h := sanitizeWindowSize(a.config.WindowState.Width, a.config.WindowState.Height)

		if runtime.GOOS == "windows" {
			a.window.SetSize(w, h)
		}

		x, y := a.config.WindowState.X, a.config.WindowState.Y

		unset := x == 0 && y == 0

		if unset || !positionVisible(screenWorkAreas(a.app.Screen.GetAll()), x, y, w, h) {
			x, y = a.centeredPosition(w, h)
		}

		a.window.SetPosition(x, y)
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
	a.SaveWindowState()

	go func() {
		for _, c := range a.clients {
			c.Disconnect()
		}
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

func (a *App) Connect(platform chat.Platform, input string) error {
	c, ok := a.clients[platform]

	if !ok {
		return fmt.Errorf("unknown platform: %s", platform)
	}

	return c.Connect(input)
}

func (a *App) Disconnect(platform chat.Platform) error {
	c, ok := a.clients[platform]

	if !ok {
		return fmt.Errorf("unknown platform: %s", platform)
	}

	c.Disconnect()

	return nil
}

func (a *App) ResolveYouTubeVideo(input string) (string, error) {
	return youtube.ResolveVideoURL(input)
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

func (a *App) centeredPosition(w, h int) (int, int) {
	primary := a.app.Screen.GetPrimary()

	if primary == nil {
		return 0, 0
	}

	return centerInWorkArea(primary.WorkArea, w, h)
}

func (a *App) CenterOnScreen() {
	w, h := a.window.Size()
	x, y := a.centeredPosition(w, h)

	a.window.SetPosition(x, y)
	a.window.Show()
	a.window.Focus()
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
