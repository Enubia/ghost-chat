package main

import (
	"embed"
	"ghost-chat/internal/config"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

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

	app := NewApp(cfg, configPath)

	err = wails.Run(&options.App{
		Title:  "ghost-chat",
		Width:  cfg.WindowState.Width,
		Height: cfg.WindowState.Height,
		// we set this so that the app doesn't flash in the default position before moving to the saved position in startup
		// https://github.com/wailsapp/wails/issues/1702
		StartHidden: true,
		Frameless:   true,
		AlwaysOnTop: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		OnStartup:        app.startup,
		Bind: []any{
			app,
		},
		OnBeforeClose: app.onBeforeClose,
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
