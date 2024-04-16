import { unlinkSync } from 'node:fs';

import { app } from 'electron';
import ElectronStore from 'electron-store';

import type { AppStore } from '@shared/types';

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
        },
    });
}
