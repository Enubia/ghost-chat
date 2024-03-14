import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createPinia } from 'pinia';

import messages from '@intlify/unplugin-vue-i18n/messages';
import ElectronStore from 'electron-store';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import './assets/scss/main.scss';
import './components/fontAwesome';

import App from './App.vue';

const electronStore = new ElectronStore<AppStore>();

const i18n = createI18n<false>({
    locale: electronStore.get('general').language,
    fallbackLocale: 'en-US',
    messages,
    legacy: false,
});

const pinia = createPinia();

createApp(App)
    .use(i18n)
    .use(pinia)
    .component('FontAwesomeIcon', FontAwesomeIcon)
    .mount('#app');
