package tray

type Callbacks struct {
	OnToggleVanish func()
	OnOpenConfig   func()
	OnQuit         func()
}

var cbs Callbacks
