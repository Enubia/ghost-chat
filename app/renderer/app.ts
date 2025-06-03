import messages from '@intlify/unplugin-vue-i18n/messages';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHashHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';

import App from './App.vue';
// oxlint-disable-next-line no-unassigned-import
import './assets/css/index.css';
import * as IpcHandler from './lib/ipchandler';

const router = createRouter({
    routes,
    history: createWebHashHistory(),
});

IpcHandler.getGeneral()
    .then((general) => {
        const i18n = createI18n<false>({
            locale: general.language,
            fallbackLocale: 'en-US',
            messages,
            legacy: false,
        });

        createApp(App).use(router).use(i18n).mount('#app');
    })
    .catch((error) => {
        console.error(error);
    });
