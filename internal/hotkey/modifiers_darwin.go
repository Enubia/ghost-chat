package hotkey

import "golang.design/x/hotkey"

var modifierMap = map[string]hotkey.Modifier{
	"ctrl":    hotkey.ModCtrl,
	"control": hotkey.ModCtrl,
	"shift":   hotkey.ModShift,
	"alt":     hotkey.ModOption,
	"option":  hotkey.ModOption,
	"cmd":     hotkey.ModCmd,
	"command": hotkey.ModCmd,
	"meta":    hotkey.ModCmd,
	"super":   hotkey.ModCmd,
}
