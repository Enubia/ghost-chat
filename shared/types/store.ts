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

type PathImpl<T, Key extends keyof T> = Key extends string
    ? T[Key] extends Record<string, any>
        ? `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}` | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
        : never
    : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;

export type StorePath = Path<AppStore>;

type Split<S extends string, D extends string> =
    string extends S ? string[] :
        S extends `${infer T}${D}${infer Rem}` ? [T, ...Split<Rem, D>] :
                [S];

type ArrToPath<T, P extends string[]> = P extends [infer K, ...infer R]
    ? K extends keyof T
        ? R extends string[]
            ? ArrToPath<T[K], R>
            : never
        : never
    : T;

export type StorePathValue<T, P extends StorePath> = ArrToPath<T, Split<P, '.'>>;
