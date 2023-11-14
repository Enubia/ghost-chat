<template>
    <VersionCheck
        v-if="checkingVersion"
        @remove-loading="checkingVersion = false"
    />
    <header v-if="showMenuBar">
        <DropDownMenu
            :key="settingsKey"
            :is-chat-page="showChat"
            :is-external-page="showExternalSource"
            :is-start-page="showStart"
            :channel="chatOptions.channel"
            :store="store"
            @show-start="showView('start')"
            @show-chat="showView('chat')"
            @vanish="ipcRenderer.send(IpcEvent.Vanish)"
        />
        <MenuButtons
            :store="store"
            :is-chat="showChat"
            :is-external="showExternalSource"
            @back="showView('start')"
        />
    </header>
    <main class="container-fluid">
        <Start
            v-if="showStart"
            :store="store"
            @channel="enableChat"
            @source="enableExternalSource"
        />
        <Chat
            v-else-if="showChat"
            :store="store"
        />
        <ExternalSource
            v-else-if="showExternalSource"
            :store="store"
            :external-source="externalSource"
        />
        <Settings
            v-else-if="showSettings"
            :key="settingsKey"
        />
    </main>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { IpcEvent } from '../shared/constants';
import { AppStore } from '../shared/types';

import MenuButtons from './components/header/Buttons.vue';
import DropDownMenu from './components/header/Dropdown.vue';
import Chat from './pages/Chat.vue';
import ExternalSource from './pages/ExternalSource.vue';
import Settings from './pages/Settings.vue';
import Start from './pages/Start.vue';
import VersionCheck from './pages/VersionCheck.vue';

const store = new ElectronStore<AppStore>();

const showStart = ref(true);
const showChat = ref(false);
const showSettings = ref(false);
const showExternalSource = ref(false);
const settingsKey = ref(0);

const savedWindowState = ref(store.get('savedWindowState'));
const chatOptions = ref(store.get('chatOptions'));
const settings = ref(store.get('settings'));
const showMenuBar = ref(true);

const externalSource = ref('');

const checkingVersion = ref(!store.get('savedWindowState').isTransparent);

const $html = document.querySelector('html');

if (!$html?.getAttribute('data-theme')) {
    const theme = savedWindowState.value.theme;
    $html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

const showApp = () => {
    document.querySelector('#app')?.removeAttribute('vanished');
    showMenuBar.value =
        !store.get('savedWindowState').isTransparent && !settings.value.isOpen;
};

const showView = <T = 'chat' | 'start' | 'settings' | 'externalSource',>(
    view: T,
) => {
    switch (view) {
        case 'chat':
            showChat.value = true;
            showStart.value = false;
            showSettings.value = false;
            showExternalSource.value = false;
            showMenuBar.value = true;
            break;

        case 'start':
            showChat.value = false;
            showStart.value = true;
            showSettings.value = false;
            showExternalSource.value = false;
            showMenuBar.value = true;
            break;

        case 'settings':
            showChat.value = false;
            showStart.value = false;
            showSettings.value = true;
            showExternalSource.value = false;
            showMenuBar.value = false;
            checkingVersion.value = false;
            break;

        case 'externalSource':
            showChat.value = false;
            showStart.value = false;
            showSettings.value = false;
            showExternalSource.value = true;
            showMenuBar.value = true;
            break;
    }
};

const enableChat = (channel: string) => {
    store.set('chatOptions.channel', channel);
    showView('chat');
};

const enableExternalSource = (source: string) => {
    externalSource.value = source;
    showView('externalSource');
};

const vanish = () => {
    const storeWindowState = store.get('savedWindowState');

    if (storeWindowState.isTransparent) {
        document.querySelector('#app')?.setAttribute('vanished', 'true');

        showMenuBar.value = false;
    }
};

if (settings.value.isOpen) {
    showView('settings');
}

ipcRenderer.on(IpcEvent.Rerender, () => settingsKey.value++);
ipcRenderer.on(IpcEvent.Vanish, vanish);
ipcRenderer.on(IpcEvent.ShowApp, showApp);
</script>
