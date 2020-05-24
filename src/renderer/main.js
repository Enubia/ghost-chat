import Vue from 'vue';
import Electron from 'electron';
import ElectronStore from 'electron-store';

import App from './App';
import router from './router.js';
import store from './store';

Vue.config.productionTip = false;

Vue.prototype.$electron = Electron;
Vue.prototype.$config = new ElectronStore();
Vue.prototype.$open = (link) => Electron.shell.openExternal(link);

/* eslint-disable no-new */
new Vue({
  ...App,
  router,
  store,
}).$mount('#app');
