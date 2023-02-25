import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ipcRenderer } from 'electron';
import { createApp } from 'vue';

import './assets/scss/main.scss';
import './helper/fontAwesome';

import App from './App.vue';

import './api';

ipcRenderer.on('removeLoading', () => {
	postMessage({ payload: 'removeLoading' }, '*');
});

createApp(App).component('FontAwesomeIcon', FontAwesomeIcon).mount('#app');
