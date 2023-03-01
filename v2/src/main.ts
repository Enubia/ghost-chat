import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ElectronStore from 'electron-store';
import { createApp } from 'vue';

import { AppStore } from '../shared/constants';

import './assets/scss/main.scss';
import './helper/fontAwesome';

import App from './App.vue';

const store = new ElectronStore<AppStore>();

createApp(App, { store }).component('FontAwesomeIcon', FontAwesomeIcon).mount('#app');
