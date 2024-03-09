<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import type { Ref } from 'vue';
import { provide, ref } from 'vue';

import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

import ChangeLog from './pages/changelog.vue';
import Chat from './pages/chat.vue';
import ExternalSource from './pages/externalsource.vue';
import Settings from './pages/settings.vue';
import Start from './pages/start.vue';
import VersionCheck from './pages/versioncheck.vue';

const store = new ElectronStore<AppStore>();

provide('store', store);

const showChangelog = ref(false);
const showChat = ref(false);
const showExternalSource = ref(false);
const showSettings = ref(false);
const showStart = ref(true);
const settingsKey = ref(0);

const savedWindowState = ref(store.get('savedWindowState'));
const chatOptions = ref(store.get('chatOptions'));
const settings = ref(store.get('settings'));
const showMenuBar = ref(true);

const externalSource = ref('');

const checkingVersion = ref(!store.get('savedWindowState').isTransparent);

const $html = document.documentElement;

if (!$html.classList.contains('dark')) {
    const theme = savedWindowState.value.theme;
    $html.classList.add(theme === 'dark' ? 'dark' : 'light');
}

function showApp() {
    document.querySelector('#app')?.removeAttribute('vanished');
    showMenuBar.value
        = !store.get('savedWindowState').isTransparent && !settings.value.isOpen;
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
    store.set('chatOptions.channel', channel);
    showView('chat');
}

function enableExternalSource(source: string) {
    const externalSources = store.get('general').externalBrowserSources || [];

    if (!externalSources.includes(source)) {
        externalSources.push(source);
        store.set('general.externalBrowserSources', externalSources);
    }

    externalSource.value = source;
    showView('externalSource');
}

function vanish() {
    const storeWindowState = store.get('savedWindowState');

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
    <header v-if="showMenuBar" class="flex justify-between">
        <Menu
            :key="settingsKey"
            :is-chat-page="showChat"
            :is-external-page="showExternalSource"
            :is-start-page="showStart"
            :channel="chatOptions.channel"
            :store="store"
            @show-start="showView('start')"
            @show-chat="showView('chat')"
            @show-changelog="showView('changelog')"
            @vanish="ipcRenderer.send(IpcEvent.Vanish)"
        />
        <ActionButtons
            :store="store"
            :is-chat="showChat"
            :is-external="showExternalSource"
            @back="showView('start')"
        />
    </header>
    <main class="h-screen flex justify-center content-center flex-wrap">
        <div v-if="!showChat">
            <Start
                v-if="showStart"
                @channel="enableChat"
                @source="enableExternalSource"
            />
            <ExternalSource
                v-else-if="showExternalSource"
                :store="store"
                :external-source="externalSource"
            />
            <Settings
                v-else-if="showSettings"
                :key="settingsKey"
                :store="store"
            />
            <Suspense v-else-if="showChangelog">
                <ChangeLog />
            </Suspense>
        </div>
        <Chat
            v-else
            :store="store"
        />
    </main>
</template>
