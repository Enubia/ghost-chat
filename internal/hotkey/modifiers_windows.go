package hotkey

import "golang.design/x/hotkey"

var modifierMap = map[string]hotkey.Modifier{
	"ctrl":    hotkey.ModCtrl,
	"control": hotkey.ModCtrl,
	"shift":   hotkey.ModShift,
	"alt":     hotkey.ModAlt,
	"option":  hotkey.ModAlt,
	"cmd":     hotkey.ModWin,
	"command": hotkey.ModWin,
	"meta":    hotkey.ModWin,
	"super":   hotkey.ModWin,
}
