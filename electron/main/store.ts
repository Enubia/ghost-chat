import { unlinkSync } from 'node:fs';

import { app } from 'electron';
import ElectronStore from 'electron-store';

import type { AppStore, Twitch } from '@shared/types';

import { StoreDefaults } from '@shared/constants';

export default function createStore() {
    return new ElectronStore<AppStore>({
        defaults: {
            ...StoreDefaults,

            // Hack to make sure the store is always up-to-date at first init,
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
                unlinkSync(store.path);
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

                let size: typeof StoreDefaults.options.twitch.size = 1;

                if (chatOptions.fontSize > 20 && chatOptions.fontSize <= 30) {
                    size = 2;
                } else if (chatOptions.fontSize > 30) {
                    size = 3;
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
                    size,
                };

                store.set('options.twitch', data);

                // @TODO: enable this before release
                // store.reset('general');
                // store.delete('chatOptions');
            },
        },
    });
}
