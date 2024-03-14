<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import type { Ref } from 'vue';
import { provide, ref } from 'vue';

import MenuButtons from '@components/header/Buttons.vue';
import DropDownMenu from '@components/header/Dropdown.vue';
import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

import ChangeLog from './pages/changelog.vue';
import Chat from './pages/chat.vue';
import ExternalSource from './pages/externalsource.vue';
import Settings from './pages/settings.vue';
import Start from './pages/start.vue';
import VersionCheck from './pages/versioncheck.vue';

const electronStore = new ElectronStore<AppStore>();

provide('electronStore', electronStore);

const showChangelog = ref(false);
const showChat = ref(false);
const showExternalSource = ref(false);
const showSettings = ref(false);
const showStart = ref(true);
const settingsKey = ref(0);

const savedWindowState = ref(electronStore.get('savedWindowState'));
const chatOptions = ref(electronStore.get('chatOptions'));
const settings = ref(electronStore.get('settings'));
const showMenuBar = ref(true);

const externalSource = ref('');

const checkingVersion = ref(!electronStore.get('savedWindowState').isTransparent);

const $html = document.querySelector('html');

if (!$html?.getAttribute('data-theme')) {
    const theme = savedWindowState.value.theme;
    $html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

function showApp() {
    document.querySelector('#app')?.removeAttribute('vanished');
    showMenuBar.value
        = !electronStore.get('savedWindowState').isTransparent && !settings.value.isOpen;
}

type Views = 'changelog' | 'chat' | 'start' | 'settings' | 'externalSource';

function showView<T = Views>(view: T) {
    const views: {
        [key in Views]: {
            ref: Ref<boolean>;
        };
    } = {
        changelog: {
            ref: showChangelog,
        },
        chat: {
            ref: showChat,
        },
        start: {
            ref: showStart,
        },
        settings: {
            ref: showSettings,
        },
        externalSource: {
            ref: showExternalSource,
        },
    };

    Object.keys(views).forEach((key) => {
        const viewKey = key as keyof typeof views;
        views[viewKey].ref.value = viewKey === view;
    });
}

function enableChat(channel: string) {
    electronStore.set('chatOptions.channel', channel);
    showView('chat');
}

function enableExternalSource(source: string) {
    const externalSources = electronStore.get('general').externalBrowserSources || [];

    if (!externalSources.includes(source)) {
        externalSources.push(source);
        electronStore.set('general.externalBrowserSources', externalSources);
    }

    externalSource.value = source;
    showView('externalSource');
}

function vanish() {
    const storeWindowState = electronStore.get('savedWindowState');

    if (storeWindowState.isTransparent) {
        document.querySelector('#app')?.setAttribute('vanished', 'true');

        showMenuBar.value = false;
    }
}

if (settings.value.isOpen) {
    showView('settings');
}

ipcRenderer.on(IpcEvent.Rerender, () => settingsKey.value++);
ipcRenderer.on(IpcEvent.Vanish, vanish);
ipcRenderer.on(IpcEvent.ShowApp, showApp);
</script>

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
            :store="electronStore"
            @show-start="showView('start')"
            @show-chat="showView('chat')"
            @show-changelog="showView('changelog')"
            @vanish="ipcRenderer.send(IpcEvent.Vanish)"
        />
        <MenuButtons
            :store="electronStore"
            :is-chat="showChat"
            :is-external="showExternalSource"
            @back="showView('start')"
        />
    </header>
    <main class="container-fluid">
        <Start
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
        </Suspense>
    </main>
</template>
