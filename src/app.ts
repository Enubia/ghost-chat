import messages from '@intlify/unplugin-vue-i18n/messages';
import ElectronStore from 'electron-store';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHashHistory } from 'vue-router/auto';

import type { AppStore } from '@shared/types';

import App from './App.vue';

import './assets/css/index.css';

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
});

const electronStore = new ElectronStore<AppStore>();

const i18n = createI18n<false>({
    locale: electronStore.get('general').language,
    fallbackLocale: 'en-US',
    messages,
    legacy: false,
});

createApp(App)
    .use(router)
    .use(i18n)
    .mount('#app');
