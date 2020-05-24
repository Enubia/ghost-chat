import Vue from 'vue';
import * as Electron from 'electron';
import * as ElectronStore from 'electron-store';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/scss/main.scss';

import App from './App.vue';
import router from './router';
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
