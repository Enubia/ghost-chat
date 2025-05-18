import type { AppStore, Keybinds, Twitch } from '#ipc/types/store.js';

import { app } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';

import { existsSync, unlinkSync } from 'node:fs';

import { StoreDefaults } from '#ipc/constants/store/defaults.js';

export default function createStore() {
    log.info('App version:', app.getVersion());

    return new ElectronStore<AppStore>({
        defaults: {
            ...StoreDefaults,

            // Hack to make sure the store is alwas up-to-date at first init,
            // default behavior of electron-store
            // being to consider the store in version '0.0.0' by default
            // @ts-expect-error https://github.com/sindresorhus/electron-store/issues/256
            __internal__: {
                migrations: {
                    version: app.getVersion(),
                },
            },
        },

        // clears the config is a user edits it and causes a syntax error
        clearInvalidConfig: true,
        migrations: {
            '2.0.0': (store) => {
                // delete store file initially
                // there are old keys that might conflict with some of the new stuff
                if (existsSync(store.path)) {
                    unlinkSync(store.path);
                }
            },
            '2.8.0': (store) => {
                store.set('general.showSupportBox', true);
                store.set('general.launchCounter', 0);
            },
            '2.8.1': (store) => {
                store.set('updater.disableAutoUpdates', false);
            },
            '3.0.0': (store) => {
                const chatOptions = store.get('chatOptions', {});

                let fontSize: typeof StoreDefaults.options.twitch.fontSize = 1;

                if (chatOptions.fontSize > 20 && chatOptions.fontSize <= 30) {
                    fontSize = 2;
                } else if (chatOptions.fontSize > 30) {
                    fontSize = 3;
                }

                const data: Twitch = {
                    ...StoreDefaults.options.twitch,
                    userBlacklist: chatOptions.userBlacklist,
                    defaultChannel: chatOptions.defaultChannel,
                    css: chatOptions.customCSS,
                    js: chatOptions.customJS,
                    fade: chatOptions.fadeMessages,
                    fadeTimeout: chatOptions.fadeTimeout,
                    bots: chatOptions.showBotActivity,
                    fontSize,
                };

                store.set('options.twitch', data);

                store.get('keybind.vanishKeybind');

                const keybinds: Keybinds = {
                    ...StoreDefaults.keybinds,
                    vanish: {
                        ...StoreDefaults.keybinds.vanish,
                        keybind: store.get('keybind.vanishKeybind') || null,
                    },
                };

                store.set('keybinds', keybinds);

                store.reset('general');
                store.delete('chatOptions');
                store.delete('keybind');
            },
            '3.0.1': (store) => {
                store.delete('chatOptions');
            },
            '3.0.2': (store) => {
                const data: Twitch = {
                    ...StoreDefaults.options.twitch,
                    ...store.get('options.twitch'),
                };

                store.set('options.twitch', data);
            },
            '3.2.0': (store) => {
                store.set('options.twitch.useJChat', false);
                store.set('options.twitch.theme', 'undefined');
                store.set('options.twitch.preventClipping', false);
                store.set('options.twitch.fontSizeExact', 14);
            },
            '3.3.0': (store) => {
                store.set('updater.channel', 'stable');
                store.set('updater.disableAutoUpdates', true);
            },
            '3.5.0': (store) => {
                store.set('options.youtube.channelId', '');
                store.set('options.youtube.css', '');
                store.set('options.youtube.js', '');
                store.set('options.youtube.defaultChannelId', '');
                store.set('options.youtube.userBlacklist', []);
                store.set('options.youtube.retries', 50);
                store.set('options.youtube.fetchDelay', 5);
                store.set('options.youtube.videoUrl', '');
            },
        },
    });
}
