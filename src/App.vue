<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { provide, ref } from 'vue';

import MenuButtons from '@components/header/Buttons.vue';
import DropDownMenu from '@components/header/Dropdown.vue';
import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

import { useRouter } from 'vue-router';

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

// TODO: check why the app routes back to / sometimes without any reason
console.log('------------------ dummy to check if rerendered');

ipcRenderer.on(IpcEvent.Vanish, vanish);
ipcRenderer.on(IpcEvent.ShowApp, showApp);
</script>

<template>
    <header v-if="showMenuBar">
        <DropDownMenu />
        <MenuButtons />
    </header>
    <main class="container-fluid">
        <router-view />
    </main>
</template>
