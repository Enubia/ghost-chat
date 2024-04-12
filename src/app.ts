import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import messages from '@intlify/unplugin-vue-i18n/messages';
import ElectronStore from 'electron-store';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import './assets/scss/main.scss';
import './components/fontAwesome';

import { createRouter, createWebHistory } from 'vue-router/auto';
import App from './App.vue';

const router = createRouter({
    history: createWebHistory(),
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
    .component('FontAwesomeIcon', FontAwesomeIcon)
    .mount('#app');
