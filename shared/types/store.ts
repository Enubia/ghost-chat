interface Shared {
    channel: string;
    fade: boolean;
    css: string;
    js: string;
    defaultChannel: string;
    userBlacklist: string[];
    fadeTimeout: number;
}

export interface Twitch extends Shared {
    fontSize: 1 | 2 | 3;
    animate: boolean;
    bots: boolean;
    hideCommands: boolean;
    hideBadges: boolean;
    font: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
    stroke: false | 1 | 2 | 3 | 4;
    shadow: false | 1 | 2 | 3;
    smallCaps: boolean;
}

export interface Kick extends Shared {
    fontSize: 'Small' | 'Medium' | 'Large';
    stroke: 'Off' | 'Thin' | 'Medium' | 'Thick' | 'Thicker';
    animate: boolean;
    badges: boolean;
    commands: boolean;
    bots: boolean;
}

export interface ExternalBrowserSource {
    sources: string[];
    css: string;
    js: string;
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
    mac: {
        quitOnClose: boolean;
        hideDockIcon: boolean;
    };
    language: string;
}

export interface Updater {
    channel: 'latest' | 'beta';
    disableAutoUpdates: boolean;
}

export interface Keybind {
    vanishKeybind: string | null;
}

export interface AppStore {
    /**
     * @deprecated Only used for migration purposes
     */
    chatOptions?: Record<string, any>;
    options: {
        twitch: Twitch;
        kick: Kick;
        external: ExternalBrowserSource;
    };
    savedWindowState: WindowState;
    settings: Settings;
    general: General;
    updater: Updater;
    keybind: Keybind;
}
