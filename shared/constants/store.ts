export const StoreKeys = {
    ChatOptions: 'chatOptions',
    SavedWindowState: 'savedWindowState',
    Settings: 'settings',
    Updater: 'updater',
    General: 'general',
    Keybind: 'keybind',
} as const;

export const StoreDefaults = {
    chatOptions: {
        channel: '',
        fadeMessages: false,
        fadeTimeout: 30,
        showBotActivity: false,
        customCSS: '',
        customJS: '',
        defaultChannel: '',
        preventClipping: false,
        chatTheme: 'undefined',
        fontSize: '14',
        userBlacklist: [],
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
        externalBrowserSources: [],
        mac: {
            quitOnClose: false,
            hideDockIcon: false,
        },
        language: 'en-US',
        showSupportBox: true,
        launchCounter: 0,
    },
    updater: {
        channel: 'latest',
        disableAutoUpdate: false,
    },
    keybind: {
        vanishKeybind: null,
    },
};
