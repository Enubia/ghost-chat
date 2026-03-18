package hotkey

import "golang.design/x/hotkey"

var modifierMap = map[string]hotkey.Modifier{
	"ctrl":    hotkey.ModCtrl,
	"control": hotkey.ModCtrl,
	"shift":   hotkey.ModShift,
	"alt":     hotkey.Mod1,
	"option":  hotkey.Mod1,
	"cmd":     hotkey.Mod4,
	"command": hotkey.Mod4,
	"meta":    hotkey.Mod4,
	"super":   hotkey.Mod4,
}
