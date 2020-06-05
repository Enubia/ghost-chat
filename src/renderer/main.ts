import Vue from 'vue';
import ElectronStore from 'electron-store';

import './assets/scss/main.scss';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.prototype.$config = new ElectronStore();

new Vue({
  ...App,
  router,
  store,
}).$mount('#app');
