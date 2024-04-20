<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/auto';

import type { AppStore } from '@shared/types';

import MenuButtons from '@components/header/Buttons.vue';
import DropDownMenu from '@components/header/Dropdown.vue';
import { IpcEvent } from '@shared/constants';

const electronStore = new ElectronStore<AppStore>();

provide('electronStore', electronStore);

const router = useRouter();
const route = useRoute();

const { t } = useI18n();

const showMenuBar = ref(true);
const showFooter = ref(true);
const rerenderKey = ref(0);

const savedWindowState = electronStore.get('savedWindowState');
const settings = electronStore.get('settings');
const isTransparent = electronStore.get('savedWindowState').isTransparent;
const autoUpdatesDisabled = electronStore.get('updater').disableAutoUpdates;

const footerExcludeList: typeof route.name[] = ['/webview/twitch', '/webview/externalsource', '/versioncheck'];

if (!autoUpdatesDisabled && !isTransparent) {
    if (settings.isOpen) {
        router.push('/settings/general');
    } else {
        router.push('/versioncheck');
    }
}

const $html = document.querySelector('html');
const $app = document.querySelector('#app');

$html?.classList.add(savedWindowState.theme || '');

watch(route, () => {
    showFooter.value = !footerExcludeList.includes(route.name);
    showMenuBar.value = !(route.path.startsWith('/settings') || route.name === '/versioncheck');
});

ipcRenderer.on(IpcEvent.Vanish, () => {
    $app?.setAttribute('vanished', 'true');
    showMenuBar.value = false;
});
ipcRenderer.on(IpcEvent.ShowApp, () => {
    $app?.removeAttribute('vanished');
    showMenuBar.value = !isTransparent && !settings.isOpen;
});
ipcRenderer.on(IpcEvent.Rerender, () => {
    rerenderKey.value += 1;
});
ipcRenderer.on(IpcEvent.ThemeChanged, () => {
    const isDarkTheme = $html?.classList.contains('dark');

    if (isDarkTheme) {
        $html?.classList.remove('dark');
    } else {
        $html?.classList.add('dark');
    }
});
</script>

<template>
    <div :key="rerenderKey" class="min-h-dvh">
        <header
            v-if="showMenuBar" class="flex justify-between items-center w-full top-0 z-10"
            :class="footerExcludeList.includes(route.name) ? 'absolute' : 'sticky'"
        >
            <DropDownMenu />
            <MenuButtons />
        </header>
        <main>
            <router-view />
        </main>
        <footer v-if="showFooter" class="sticky bottom-0 w-full bg-background">
            <div id="paypal" class="center-elements py-2">
                <a href="https://www.paypal.com/donate/?hosted_button_id=JMYLMVGSKXXEW" class="center-elements">
                    <small class="me-2">
                        {{ t('footer.support') }}
                    </small>
                    <Icon icon="fa6-brands:paypal" style="color: #009cde" />
                </a>
            </div>
        </footer>
    </div>
</template>
