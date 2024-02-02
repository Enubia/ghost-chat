export interface ChatOptions {
    channel: string;
    showBotActivity: boolean;
    fadeMessages: boolean;
    fadeTimeout: number;
    customCSS: string;
    customJS: string;
    defaultChannel: string;
    preventClipping: boolean;
    chatTheme: string;
    fontSize: string;
    userBlacklist: string[];
}

export interface WindowState {
    x: number;
    y: number;
    width: number;
    height: number;
    isClickThrough: boolean;
    isTransparent: boolean;
    theme: 'dark' | 'light' | null;
}

export interface Settings {
    isOpen: boolean;
    savedWindowState: Omit<WindowState, 'isClickThrough' | 'isTransparent'>;
}

export interface General {
    externalBrowserSources: string[];
    mac: {
        quitOnClose: boolean;
        hideDockIcon: boolean;
    };
    language: string;
}

export interface Updater {
    channel: 'latest' | 'beta';
}

export interface Keybind {
    vanishKeybind: string | null;
}

export interface AppStore {
    chatOptions: ChatOptions;
    savedWindowState: WindowState;
    settings: Settings;
    general: General;
    updater: Updater;
    keybind: Keybind;
}
