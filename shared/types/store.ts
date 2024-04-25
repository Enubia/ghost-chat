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
    defaultUrl: string;
    sources: string[];
    css: string;
    js: string;
}

export interface Options {
    twitch: Twitch;
    kick: Kick;
    external: ExternalBrowserSource;
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

export interface Keybinds {

    vanish: {
        keybind: string | null;
        activationMessage: string;
    };
}

export interface AppStore {
    /**
     * @deprecated Only used for migration purposes
     */
    chatOptions?: Record<string, any>;
    options: Options;
    savedWindowState: WindowState;
    settings: Settings;
    general: General;
    updater: Updater;
    keybinds: Keybinds;
    /**
     * @deprecated Only used for migration purposes
     */
    keybind?: Record<string, any>;
}

// https://github.com/toonvanstrijp/nestjs-i18n/blob/1a86bb46e9386c6450d10c9c9e609f78315752d0/src/types.ts
type IsAny<T> = unknown extends T
    ? [keyof T] extends [never]
            ? false
            : true
    : false;

type PathImpl<T, Key extends keyof T> = Key extends string
    ? IsAny<T[Key]> extends true
        ? never
        : T[Key] extends Record<string, any>
            ?
            | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
            | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
            : never
    : never;

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

type Path<T> = keyof T extends string
    ? PathImpl2<T> extends infer P
        ? P extends string | keyof T
            ? P
            : keyof T
        : keyof T
    : never;

export type StorePath = Path<AppStore>;
