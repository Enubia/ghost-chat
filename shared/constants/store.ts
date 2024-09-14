import { type AppStore, FontSize, Stroke } from '#shared/types/store.js';

export enum StoreKeys {
    Options = 'options',
    SavedWindowState = 'savedWindowState',
    Settings = 'settings',
    Updater = 'updater',
    General = 'general',
    Keybind = 'keybind',
}

export const StoreDefaults: AppStore = {
    options: {
        twitch: {
            useJChat: false,
            channel: '',
            fontSize: 1,
            animate: false,
            fade: false,
            bots: false,
            hideCommands: false,
            hideBadges: false,
            font: 0,
            stroke: false,
            shadow: false,
            smallCaps: false,
            fadeTimeout: 30,
            css: '',
            js: '',
            defaultChannel: '',
            userBlacklist: [],
            preventClipping: false,
            fontSizeExact: 14,
            theme: 'undefined',
        },
        kick: {
            channel: '',
            fontSize: FontSize.Small,
            stroke: Stroke.Off,
            animate: false,
            fade: false,
            badges: false,
            commands: false,
            bots: false,
            css: '',
            js: '',
            defaultChannel: '',
            userBlacklist: [],
            fadeTimeout: 30,
        },
        external: {
            defaultUrl: '',
            sources: [],
            css: '',
            js: '',
        },
    },
    savedWindowState: {
        x: 0,
        y: 0,
        width: 400,
        height: 600,
        isTransparent: false,
        isClickThrough: false,
        theme: null,
    },
    settings: {
        isOpen: false,
        savedWindowState: {
            x: 0,
            y: 0,
            width: 900,
            height: 760,
            theme: null,
        },
    },
    general: {
        mac: {
            quitOnClose: false,
            hideDockIcon: false,
        },
        language: 'en-US',
    },
    updater: {
        channel: 'latest',
        disableAutoUpdates: false,
    },
    keybinds: {
        vanish: {
            keybind: null,
            activationMessage: 'Vanish keybind triggered',
        },
    },
};
