import { defineStore } from 'pinia';

import type ElectronStore from 'electron-store';
import { inject } from 'vue';
import { StoreDefaults } from '@shared/constants';
import type { AppStore } from '@shared/types';

export const useAppStore = defineStore({
    id: 'app',
    state: () => ({
        ...StoreDefaults,

        /**
         * @summary The file store, do not use directly, use the `saveToElectronStore` action instead
         */
        $electronStore: inject<ElectronStore<AppStore>>('electronStore'),
    }),
    actions: {
        setLanguage(language: string) {
            this.general.language = language;
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
