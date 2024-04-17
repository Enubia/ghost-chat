<script setup lang="ts">
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

const savedWindowState = electronStore.get('savedWindowState');
const settings = electronStore.get('settings');
const isTransparent = electronStore.get('savedWindowState').isTransparent;
const autoUpdatesDisabled = electronStore.get('updater').disableAutoUpdates;

if (!autoUpdatesDisabled && !isTransparent) {
    if (settings.isOpen) {
        router.push('/settings');
    } else {
        router.push('/versioncheck');
    }
}

const $html = document.querySelector('html');
const $app = document.querySelector('#app');

$html?.classList.add(savedWindowState.theme || '');

watch(route, () => {
    showFooter.value = !(route.name === '/twitch' || route.name === '/externalsource');
    showMenuBar.value = !(route.name === '/settings' || route.name === '/versioncheck');
});

ipcRenderer.on(IpcEvent.Vanish, () => {
    $app?.setAttribute('vanished', 'true');
    showMenuBar.value = false;
});
ipcRenderer.on(IpcEvent.ShowApp, () => {
    $app?.removeAttribute('vanished');
    showMenuBar.value = !isTransparent && !settings.isOpen;
});
</script>

<template>
    <div class="min-h-dvh">
        <header v-if="showMenuBar" class="flex justify-between items-center absolute w-full top-0 z-10">
            <DropDownMenu />
            <MenuButtons />
        </header>
        <main>
            <router-view />
        </main>
        <footer v-if="showFooter" class="absolute bottom-0 w-full bg-background">
            <div id="paypal" class="center-elements py-2">
                <a href="https://www.paypal.com/donate/?hosted_button_id=JMYLMVGSKXXEW" class="center-elements">
                    <small class="me-2">
                        {{ t('start.supportBox.messageStart') }}
                        {{ t('start.supportBox.messageEnd') }}
                    </small>
                    <font-awesome-icon :icon="['fab', 'paypal']" style="color: #009cde" />
                </a>
            </div>
        </footer>
    </div>
</template>
