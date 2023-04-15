import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// eslint-disable-next-line import/no-unresolved
import messages from '@intlify/unplugin-vue-i18n/messages';
import ElectronStore from 'electron-store';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import { AppStore } from '../shared/types';

import './assets/scss/main.scss';
import './components/fontAwesome';

import App from './App.vue';

const store = new ElectronStore<AppStore>();

const i18n = createI18n<false>({
	locale: store.get('general').language,
	fallbackLocale: 'en',
	messages,
	legacy: false,
});

// TODO: figure out how to refresh the store once vanish is sent to the client
// needed to rerender the app without a background

createApp(App).use(i18n).component('FontAwesomeIcon', FontAwesomeIcon).mount('#app');
