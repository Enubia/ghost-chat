package hotkey

import (
	"strings"

	"golang.design/x/hotkey"
)

var registered *hotkey.Hotkey

func Register(keybind string, onPress func()) error {
	Unregister()

	combo, ok := parse(keybind)

	if !ok {
		return nil
	}

	hk := hotkey.New(combo.modifiers, combo.key)

	if err := hk.Register(); err != nil {
		return err
	}

	registered = hk

	go func() {
		for range hk.Keydown() {
			onPress()
		}
	}()

	return nil
}

func Unregister() {
	if registered != nil {
		registered.Unregister()
		registered = nil
	}
}

type keyCombo struct {
	modifiers []hotkey.Modifier
	key       hotkey.Key
}

func parse(keybind string) (keyCombo, bool) {
	if keybind == "" {
		return keyCombo{}, false
	}

	parts := strings.Split(strings.ToLower(keybind), "+")
	combo := keyCombo{}

	for _, part := range parts {
		part = strings.TrimSpace(part)

		if mod, ok := modifierMap[part]; ok {
			combo.modifiers = append(combo.modifiers, mod)
			continue
		}

		key, ok := keyMap[part]

		if !ok {
			return keyCombo{}, false
		}

		combo.key = key
	}

	if combo.key == 0 || len(combo.modifiers) == 0 {
		return keyCombo{}, false
	}

	return combo, true
}

var keyMap = map[string]hotkey.Key{
	"a": hotkey.KeyA, "b": hotkey.KeyB, "c": hotkey.KeyC, "d": hotkey.KeyD,
	"e": hotkey.KeyE, "f": hotkey.KeyF, "g": hotkey.KeyG, "h": hotkey.KeyH,
	"i": hotkey.KeyI, "j": hotkey.KeyJ, "k": hotkey.KeyK, "l": hotkey.KeyL,
	"m": hotkey.KeyM, "n": hotkey.KeyN, "o": hotkey.KeyO, "p": hotkey.KeyP,
	"q": hotkey.KeyQ, "r": hotkey.KeyR, "s": hotkey.KeyS, "t": hotkey.KeyT,
	"u": hotkey.KeyU, "v": hotkey.KeyV, "w": hotkey.KeyW, "x": hotkey.KeyX,
	"y": hotkey.KeyY, "z": hotkey.KeyZ,
	"0": hotkey.Key0, "1": hotkey.Key1, "2": hotkey.Key2, "3": hotkey.Key3,
	"4": hotkey.Key4, "5": hotkey.Key5, "6": hotkey.Key6, "7": hotkey.Key7,
	"8": hotkey.Key8, "9": hotkey.Key9,
	"f1": hotkey.KeyF1, "f2": hotkey.KeyF2, "f3": hotkey.KeyF3, "f4": hotkey.KeyF4,
	"f5": hotkey.KeyF5, "f6": hotkey.KeyF6, "f7": hotkey.KeyF7, "f8": hotkey.KeyF8,
	"f9": hotkey.KeyF9, "f10": hotkey.KeyF10, "f11": hotkey.KeyF11, "f12": hotkey.KeyF12,
	"space": hotkey.KeySpace, "tab": hotkey.KeyTab, "escape": hotkey.KeyEscape,
	"return": hotkey.KeyReturn, "enter": hotkey.KeyReturn, "delete": hotkey.KeyDelete,
	"left": hotkey.KeyLeft, "right": hotkey.KeyRight, "up": hotkey.KeyUp, "down": hotkey.KeyDown,
}
