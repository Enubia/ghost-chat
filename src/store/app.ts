import { defineStore } from 'pinia';

import ElectronStore from 'electron-store';
import { StoreDefaults } from '@shared/constants';
import type { AppStore } from '@shared/types';

const electronStore = new ElectronStore<AppStore>();

const initialState = {
    ...StoreDefaults,
    ...electronStore.store,
};

export const useAppStore = defineStore({
    id: 'app',
    state: () => ({
        ...initialState,

        /**
         * @summary The file store, do not use directly if you can avoid it.
         */
        $electronStore: electronStore,
    }),
    actions: {
        resetSettings() {
            this.$reset();
            this.saveToElectronStore();
        },

        saveToElectronStore() {
            if (!this.$electronStore) {
                return;
            }

            this.$electronStore.set('chatOptions', this.$state.chatOptions);
            this.$electronStore.set('savedWindowState', this.$state.savedWindowState);
            this.$electronStore.set('settings', this.$state.settings);
            this.$electronStore.set('general', this.$state.general);
            this.$electronStore.set('updater', this.$state.updater);
            this.$electronStore.set('keybind', this.$state.keybind);
        },
    },
});
