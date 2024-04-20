import type { AppStore } from '@shared/types';

export const StoreKeys = {
    Options: 'options',
    SavedWindowState: 'savedWindowState',
    Settings: 'settings',
    Updater: 'updater',
    General: 'general',
    Keybind: 'keybind',
} as const;

export const StoreDefaults: AppStore = {
    options: {
        twitch: {
            channel: '',
            size: 1,
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
        },
        kick: {
            channel: '',
            css: '',
            js: '',
            defaultChannel: '',
            userBlacklist: [],
        },
        external: {
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
    keybind: {
        vanishKeybind: null,
    },
};
