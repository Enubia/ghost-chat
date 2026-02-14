package main

import (
	"context"
	"fmt"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	wailsRuntime.EventsOn(a.ctx, "test:from-frontend", func(optionalData ...any) {
		fmt.Println(optionalData)
	})
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GetAppInfo() string {
	return "Ghost Chat v4.0.0"
}

func (a *App) SendTestEvent() {
	wailsRuntime.EventsEmit(a.ctx, "test:hello", "Hello from Go!")
}
