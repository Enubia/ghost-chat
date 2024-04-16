<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { provide, ref } from 'vue';
import { useRouter } from 'vue-router/auto';

import type { AppStore } from '@shared/types';

import MenuButtons from '@components/header/Buttons.vue';
import DropDownMenu from '@components/header/Dropdown.vue';
import { IpcEvent } from '@shared/constants';

const electronStore = new ElectronStore<AppStore>();

provide('electronStore', electronStore);

const router = useRouter();

const showMenuBar = ref(true);

const savedWindowState = electronStore.get('savedWindowState');
const settings = electronStore.get('settings');
const isTransparent = electronStore.get('savedWindowState').isTransparent;
const autoUpdatesDisabled = electronStore.get('updater').disableAutoUpdates;

if (!autoUpdatesDisabled && !isTransparent) {
    if (settings.isOpen) {
        showMenuBar.value = false;
        router.push('/settings');
    } else {
        router.push('/versioncheck');
    }
}

const $html = document.querySelector('html');

if (!$html?.getAttribute('data-theme')) {
    $html?.setAttribute('data-theme', savedWindowState.theme === 'dark' ? 'dark' : 'light');
}

function showApp() {
    document.querySelector('#app')?.removeAttribute('vanished');
    showMenuBar.value = !isTransparent && !settings.isOpen;
}

function vanish() {
    document.querySelector('#app')?.setAttribute('vanished', 'true');
    showMenuBar.value = false;
}

ipcRenderer.on(IpcEvent.Vanish, vanish);
ipcRenderer.on(IpcEvent.ShowApp, showApp);
</script>

<template>
    <header v-if="showMenuBar" class="flex justify-between">
        <DropDownMenu />
        <MenuButtons />
    </header>
    <main class="container-fluid">
        <router-view />
    </main>
</template>
