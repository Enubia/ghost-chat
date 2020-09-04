import Vue from 'vue';
import ElectronStore from 'electron-store';
import { ipcRenderer } from 'electron';
import './assets/scss/main.scss';
import { StoreConstants } from '@/utils/constants';
import App from './App.vue';
import router from './router';
import { hexOpacityMapping } from './helper/hexOpacityMapping';

ipcRenderer.on('settings', async (_event, windowSize) => {
  await router.push({ path: '/settings', query: windowSize });
});

ipcRenderer.on('index', async () => {
  await router.push('/index');
});

ipcRenderer.on('chat', async () => {
  await router.push('/chat');
});

const electronStore = new ElectronStore();

Vue.config.productionTip = false;

Vue.prototype.$config = electronStore;
Vue.prototype.$windowBackgroundColor = `#${String(
  electronStore.get(StoreConstants.BackgroundColor, '5c279d'),
)}${hexOpacityMapping[String(electronStore.get(StoreConstants.OpacityLevel, '1'))]}`;
Vue.prototype.$showBorder = electronStore.get(StoreConstants.ShowBorders, true);
Vue.prototype.$fontSize = electronStore.get(StoreConstants.FontSize, undefined);

new Vue({
  ...App,
  router,
}).$mount('#app');
