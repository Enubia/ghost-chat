<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import type { Ref } from 'vue';
import { provide, ref } from 'vue';

import MenuButtons from '@components/header/Buttons.vue';
import DropDownMenu from '@components/header/Dropdown.vue';
import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

import { useRouter } from 'vue-router';

const electronStore = new ElectronStore<AppStore>();

provide('electronStore', electronStore);

const router = useRouter();

const savedWindowState = ref(electronStore.get('savedWindowState'));
const settings = ref(electronStore.get('settings'));
const showMenuBar = ref(true);
const checkingVersion = ref(!electronStore.get('savedWindowState').isTransparent);
const autoUpdatesDisabled = ref(electronStore.get('updater').disableAutoUpdates);

if (!autoUpdatesDisabled.value && checkingVersion.value) {
    router.push('/versioncheck');
}

const $html = document.querySelector('html');

if (!$html?.getAttribute('data-theme')) {
    $html?.setAttribute('data-theme', savedWindowState.value.theme === 'dark' ? 'dark' : 'light');
}

function showApp() {
    document.querySelector('#app')?.removeAttribute('vanished');
    showMenuBar.value
        = !electronStore.get('savedWindowState').isTransparent && !settings.value.isOpen;
}

function vanish() {
    const storeWindowState = electronStore.get('savedWindowState');

    if (storeWindowState.isTransparent) {
        document.querySelector('#app')?.setAttribute('vanished', 'true');

        showMenuBar.value = false;
    }
}

ipcRenderer.on(IpcEvent.Vanish, vanish);
ipcRenderer.on(IpcEvent.ShowApp, showApp);
</script>

<template>
    <header v-if="showMenuBar">
        <DropDownMenu />
        <MenuButtons />
    </header>
    <main class="container-fluid">
        <!-- <Start
            v-if="showStart"
            @channel="enableChat"
            @source="enableExternalSource"
        />
        <Chat
            v-else-if="showChat"
        />
        <ExternalSource
            v-else-if="showExternalSource"
            :external-source="externalSource"
        />
        <Settings
            v-else-if="showSettings"
            :key="settingsKey"
        />
        <Suspense v-else-if="showChangelog">
            <ChangeLog />
        </Suspense> -->
        <router-view />
    </main>
</template>
