package main

import (
	"embed"
	"ghost-chat/internal/config"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed frontend/src/assets/trayicon.png
var trayIcon []byte

//go:embed build/appicon.png
var appIcon []byte

func main() {
	configPath, err := config.GetConfigPath()

	if err != nil {
		println("Error getting config path:", err.Error())
		return
	}

	cfg, err := config.Load(configPath)

	if err != nil {
		println("Error loading config:", err.Error())
		return
	}

	svc := NewApp(cfg, configPath)

	app := application.New(application.Options{
		Name: "Ghost Chat",
		Icon: appIcon,
		ShouldQuit: func() bool {
			svc.SaveWindowState()
			return true
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Assets: application.AssetOptions{
			Handler: application.BundledAssetFileServer(assets),
		},
		Services: []application.Service{
			application.NewService(svc),
		},
	})

	win := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:          "ghost-chat",
		Width:          cfg.WindowState.Width,
		Height:         cfg.WindowState.Height,
		Hidden:         true,
		Frameless:      true,
		AlwaysOnTop:    true,
		BackgroundType: application.BackgroundTypeTransparent,
		Mac: application.MacWindow{
			Backdrop: application.MacBackdropTransparent,
		},
	})

	svc.SetApp(app, win)

	tray := app.SystemTray.New()
	tray.SetTemplateIcon(trayIcon)
	tray.SetTooltip("Ghost Chat " + cfg.Version)

	menu := app.NewMenu()
	menu.Add("Ghost Chat " + cfg.Version).SetEnabled(false)
	menu.AddSeparator()
	menu.Add("Toggle Vanish").OnClick(func(_ *application.Context) { svc.ToggleVanish() })
	menu.Add("Open Config Folder").OnClick(func(_ *application.Context) { svc.OpenConfigFolder() })
	menu.AddSeparator()
	menu.Add("Quit").OnClick(func(_ *application.Context) { win.Close() })

	tray.SetMenu(menu)

	if err := app.Run(); err != nil {
		println("Error:", err.Error())
	}
}
