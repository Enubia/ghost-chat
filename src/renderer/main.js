import Vue from 'vue';
import Electron from 'electron';
import ElectronStore from 'electron-store';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App';
import router from './router.js';
import store from './store';

Vue.config.productionTip = false;

Vue.prototype.$electron = Electron;
Vue.prototype.$config = new ElectronStore();
Vue.prototype.$open = (link) => Electron.shell.openExternal(link);

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

/* eslint-disable no-new */
new Vue({
  ...App,
  router,
  store,
}).$mount('#app');
