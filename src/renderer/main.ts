import Vue from 'vue';
// import * as Electron from 'electron';
import ElectronStore from 'electron-store';

import './assets/scss/main.scss';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

// Vue.prototype.$electron = Electron;
Vue.prototype.$config = new ElectronStore();
// Vue.prototype.$open = (link) => Electron.shell.openExternal(link);

/* eslint-disable no-new */
new Vue({
  ...App,
  router,
  store,
}).$mount('#app');
