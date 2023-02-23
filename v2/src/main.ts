import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp } from 'vue';

import './assets/scss/main.scss';
import './helper/fontAwesome';

import App from './App.vue';
// import './samples/node-api';

createApp(App).component('FontAwesomeIcon', FontAwesomeIcon).mount('#app');
