import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ElectronStore from 'electron-store';
import { createApp } from 'vue';

import { AppStore } from '../shared/types';

import './assets/scss/main.scss';
import './components/fontAwesome';

import App from './App.vue';

const store = new ElectronStore<AppStore>();

createApp(App, { store }).component('FontAwesomeIcon', FontAwesomeIcon).mount('#app');
