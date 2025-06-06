// credits to @SnosMe, shamelessly stolen from https://github.com/SnosMe/awakened-poe-trade/blob/master/ipc/KeyToCode.ts

export const KeyToCode = {
    // Cancel: 3,
    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Ctrl: 17,
    Alt: 18,
    // Pause: 19,
    CapsLock: 20,
    Escape: 27,
    Space: 32,
    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,
    Insert: 45,
    Delete: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    Numpad0: 96,
    Numpad1: 97,
    Numpad2: 98,
    Numpad3: 99,
    Numpad4: 100,
    Numpad5: 101,
    Numpad6: 102,
    Numpad7: 103,
    Numpad8: 104,
    Numpad9: 105,
    NumpadMultiply: 106,
    NumpadAdd: 107,
    NumpadSubtract: 109,
    NumpadDecimal: 110,
    NumpadDivide: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    F13: 124,
    F14: 125,
    F15: 126,
    F16: 127,
    F17: 128,
    F18: 129,
    F19: 130,
    F20: 131,
    F21: 132,
    F22: 133,
    F23: 134,
    F24: 135,
    Semicolon: 186,
    Equal: 187,
    Comma: 188,
    Minus: 189,
    Period: 190,
    Slash: 191,
    Backquote: 192,
    BracketLeft: 219,
    Backslash: 220,
    BracketRight: 221,
    Quote: 222,
};

export const CodeToKey = Object.fromEntries(Object.entries(KeyToCode).map(([key, code]) => [code, key]));

export const KeyToElectron = {
    // Cancel,
    Backspace: 'Backspace',
    Tab: 'Tab',
    Enter: 'Enter',
    // Pause,
    CapsLock: 'CapsLock',
    Escape: 'Escape',
    Space: 'Space',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    End: 'End',
    Home: 'Home',
    ArrowLeft: 'Left',
    ArrowUp: 'Up',
    ArrowRight: 'Right',
    ArrowDown: 'Down',
    Insert: 'Insert',
    Delete: 'Delete',
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E',
    F: 'F',
    G: 'G',
    H: 'H',
    I: 'I',
    J: 'J',
    K: 'K',
    L: 'L',
    M: 'M',
    N: 'N',
    O: 'O',
    P: 'P',
    Q: 'Q',
    R: 'R',
    S: 'S',
    T: 'T',
    U: 'U',
    V: 'V',
    W: 'W',
    X: 'X',
    Y: 'Y',
    Z: 'Z',
    Numpad0: 'num0',
    Numpad1: 'num1',
    Numpad2: 'num2',
    Numpad3: 'num3',
    Numpad4: 'num4',
    Numpad5: 'num5',
    Numpad6: 'num6',
    Numpad7: 'num7',
    Numpad8: 'num8',
    Numpad9: 'num9',
    NumpadMultiply: 'nummult',
    NumpadAdd: 'numadd',
    NumpadSubtract: 'numsub',
    NumpadDecimal: 'numdec',
    NumpadDivide: 'numdiv',
    F1: 'F1',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12',
    F13: 'F13',
    F14: 'F14',
    F15: 'F15',
    F16: 'F16',
    F17: 'F17',
    F18: 'F18',
    F19: 'F19',
    F20: 'F20',
    F21: 'F21',
    F22: 'F22',
    F23: 'F23',
    F24: 'F24',
    Semicolon: ';',
    Equal: '=',
    Comma: ',',
    Minus: '-',
    Period: '.',
    Slash: '/',
    Backquote: '`',
    BracketLeft: '[',
    Backslash: '\\',
    BracketRight: ']',
    Quote: "'",
    // Do not change Ctrl to CmdOrCtrl. It causes registered shortcuts to
    // often not work on Mac for unknown reasons.
    Ctrl: 'Ctrl',
    Alt: 'Alt',
    Shift: 'Shift',
};

export function hotkeyToString(keys: string[], ctrl = false, shift = false, alt = false): string {
    if (keys.includes('Ctrl')) {
        ctrl = true;
    }

    if (keys.includes('Shift')) {
        shift = true;
    }

    if (keys.includes('Alt')) {
        alt = true;
    }

    keys = keys.filter((key) => !isModKey(key)).map((key) => KeyToElectron[key] || key);

    if (keys.length === 1 && isFunctionKey(keys[0]) && !ctrl && !shift && !alt) {
        return keys[0];
    }

    let mod = '';

    if (ctrl && shift && alt) {
        mod = 'Ctrl + Shift + Alt';
    } else if (shift && alt) {
        mod = 'Shift + Alt';
    } else if (ctrl && shift) {
        mod = 'Ctrl + Shift';
    } else if (ctrl && alt) {
        mod = 'Ctrl + Alt';
    } else if (alt) {
        mod = 'Alt';
    } else if (ctrl) {
        mod = 'Ctrl';
    } else if (shift) {
        mod = 'Shift';
    }

    return mod && keys.length ? `${mod} + ${keys.join(' + ')}` : keys.join(' + ') || mod;
}

export function mergeTwoHotkeys(str1: string, str2: string): string {
    return hotkeyToString(Array.from(new Set([...str1.split(' + '), ...str2.split(' + ')])));
}

export function isModKey(key: string) {
    return key === 'Ctrl' || key === 'Shift' || key === 'Alt';
}

export function isFunctionKey(key: string) {
    return key.startsWith('F') && key.length > 1 && key.length < 4;
}
