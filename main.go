package main

import (
	"embed"
	"ghost-chat/internal/config"
	"runtime"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed frontend/src/assets/trayicon.png
var trayIcon []byte

//go:embed build/appicon.png
var appIcon []byte

var version = "dev"

// initialWidth returns the starting window width. On Windows, frameless transparent
// windows have a WebView2 bug where the hit-test surface doesn't update after
// programmatic resize, so we start at the max settings width (2000) and shrink
// down in ServiceStartup. This ensures the surface covers the full area.
// https://github.com/wailsapp/wails/issues/4871
func initialWidth(savedWidth int) int {
	if runtime.GOOS == "windows" {
		return 2000
	}

	return savedWidth
}

// initialHeight returns the starting window height. On Windows, frameless transparent
// windows have a WebView2 bug where the hit-test surface doesn't update after
// programmatic resize, so we start at the max settings height (2000) and shrink
// down in ServiceStartup. This ensures the surface covers the full area.
// https://github.com/wailsapp/wails/issues/4871
func initialHeight(savedHeight int) int {
	if runtime.GOOS == "windows" {
		return 2000
	}

	return savedHeight
}

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

	normalizedVersion := config.NormalizeVersion(version)

	if err := config.RunMigrations(cfg, normalizedVersion); err != nil {
		println("Error running migrations:", err.Error())
	}

	cfg.Version = normalizedVersion

	if err := config.Save(cfg, configPath); err != nil {
		println("Error saving config:", err.Error())
	}

	svc := NewApp(cfg, configPath, version)

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
		Width:          initialWidth(cfg.WindowState.Width),
		Height:         initialHeight(cfg.WindowState.Height),
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
	tray.SetTooltip("Ghost Chat " + version)

	menu := app.NewMenu()
	menu.Add("Ghost Chat " + version).SetEnabled(false)
	menu.AddSeparator()
	menu.Add("Center on Screen").OnClick(func(_ *application.Context) { svc.CenterOnScreen() })
	menu.Add("Toggle Vanish").OnClick(func(_ *application.Context) { svc.ToggleVanish() })
	menu.Add("Open Config Folder").OnClick(func(_ *application.Context) { svc.OpenConfigFolder() })
	menu.AddSeparator()
	menu.Add("Quit").OnClick(func(_ *application.Context) { win.Close() })

	tray.SetMenu(menu)

	if err := app.Run(); err != nil {
		println("Error:", err.Error())
	}
}
