import Vue from 'vue';
import ElectronStore from 'electron-store';
import { remote, ipcRenderer } from 'electron';

// global styles
import './assets/scss/main.scss';

// custom imports
import App from './App.vue';
import router from './router';
import store from './store';
import { hexOpacityMapping } from './helper/hexOpacityMapping';
import { StoreConstants } from '../helper/constants';

import Mousetrap = require('mousetrap');

ipcRenderer.on('settings', (_event, windowSize) => {
  router.push({ path: '/settings', query: windowSize }).catch((err) => console.log(err));
});

ipcRenderer.on('index', () => {
  router.push('/index').catch((err) => console.log(err));
});

ipcRenderer.on('chat', () => {
  router.push('/chat').catch((err) => console.log(err));
});

Mousetrap.bind(['command+r', 'ctrl+r', 'f5'], () => {
  remote.getCurrentWindow().reload();
  return false; // prevents default behavior and stops event from bubbling
});

const electronStore = new ElectronStore();

Vue.config.productionTip = false;

Vue.prototype.$config = electronStore;
Vue.prototype.$windowBackgroundColor = `#${
  electronStore.get(StoreConstants.BackgroundColor) || '5c279d'
}${hexOpacityMapping[electronStore.get(StoreConstants.OpacityLevel) || '0.01']}`;
Vue.prototype.$showBorder = electronStore.get(StoreConstants.ShowBorders);

new Vue({
  ...App,
  router,
  store,
}).$mount('#app');
