import Vue from 'vue';
import ElectronStore from 'electron-store';
import { ipcRenderer } from 'electron';
import './assets/scss/main.scss';
import { StoreConstants } from '@/utils/constants';
import App from './App.vue';
import router from './router';
import { hexOpacityMapping } from './helper/hexOpacityMapping';

ipcRenderer.on('settings', (_event, windowSize) => {
  router.push({ path: '/settings', query: windowSize }).catch((err) => console.log(err));
});

ipcRenderer.on('index', () => {
  router.push('/index').catch((err) => console.log(err));
});

ipcRenderer.on('chat', () => {
  router.push('/chat').catch((err) => console.log(err));
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
}).$mount('#app');
