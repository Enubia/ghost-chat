package hotkey

import "golang.design/x/hotkey"

var platformKeys = map[string]hotkey.Key{
	"-": hotkey.Key(0x1B), "minus": hotkey.Key(0x1B),
	"=": hotkey.Key(0x18), "equal": hotkey.Key(0x18),
	",": hotkey.Key(0x2B), "comma": hotkey.Key(0x2B),
	".": hotkey.Key(0x2F), "period": hotkey.Key(0x2F),
	"/": hotkey.Key(0x2C), "slash": hotkey.Key(0x2C),
	";": hotkey.Key(0x29), "semicolon": hotkey.Key(0x29),
	"'": hotkey.Key(0x27), "quote": hotkey.Key(0x27),
	"[": hotkey.Key(0x21), "bracketleft": hotkey.Key(0x21),
	"]": hotkey.Key(0x1E), "bracketright": hotkey.Key(0x1E),
	`\`: hotkey.Key(0x2A), "backslash": hotkey.Key(0x2A),
	"`": hotkey.Key(0x32), "backquote": hotkey.Key(0x32),

	"numpad0": hotkey.Key(0x52), "numpad1": hotkey.Key(0x53),
	"numpad2": hotkey.Key(0x54), "numpad3": hotkey.Key(0x55),
	"numpad4": hotkey.Key(0x56), "numpad5": hotkey.Key(0x57),
	"numpad6": hotkey.Key(0x58), "numpad7": hotkey.Key(0x59),
	"numpad8": hotkey.Key(0x5B), "numpad9": hotkey.Key(0x5C),
	"numpadmultiply": hotkey.Key(0x43), "numpadadd": hotkey.Key(0x45),
	"numpadsubtract": hotkey.Key(0x4E), "numpaddecimal": hotkey.Key(0x41),
	"numpaddivide": hotkey.Key(0x4B), "numpadenter": hotkey.Key(0x4C),
}
