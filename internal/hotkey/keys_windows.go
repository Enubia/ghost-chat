package hotkey

import "golang.design/x/hotkey"

var platformKeys = map[string]hotkey.Key{
	"-": hotkey.Key(0xBD), "minus": hotkey.Key(0xBD),
	"=": hotkey.Key(0xBB), "equal": hotkey.Key(0xBB),
	",": hotkey.Key(0xBC), "comma": hotkey.Key(0xBC),
	".": hotkey.Key(0xBE), "period": hotkey.Key(0xBE),
	"/": hotkey.Key(0xBF), "slash": hotkey.Key(0xBF),
	";": hotkey.Key(0xBA), "semicolon": hotkey.Key(0xBA),
	"'": hotkey.Key(0xDE), "quote": hotkey.Key(0xDE),
	"[": hotkey.Key(0xDB), "bracketleft": hotkey.Key(0xDB),
	"]": hotkey.Key(0xDD), "bracketright": hotkey.Key(0xDD),
	`\`: hotkey.Key(0xDC), "backslash": hotkey.Key(0xDC),
	"`": hotkey.Key(0xC0), "backquote": hotkey.Key(0xC0),

	"numpad0": hotkey.Key(0x60), "numpad1": hotkey.Key(0x61),
	"numpad2": hotkey.Key(0x62), "numpad3": hotkey.Key(0x63),
	"numpad4": hotkey.Key(0x64), "numpad5": hotkey.Key(0x65),
	"numpad6": hotkey.Key(0x66), "numpad7": hotkey.Key(0x67),
	"numpad8": hotkey.Key(0x68), "numpad9": hotkey.Key(0x69),
	"numpadmultiply": hotkey.Key(0x6A), "numpadadd": hotkey.Key(0x6B),
	"numpadsubtract": hotkey.Key(0x6D), "numpaddecimal": hotkey.Key(0x6E),
	"numpaddivide": hotkey.Key(0x6F), "numpadenter": hotkey.Key(0x0D),
}
