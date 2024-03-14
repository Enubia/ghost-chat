<script setup lang="ts">
import { ipcRenderer } from 'electron';
import type ElectronStore from 'electron-store';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { IpcEvent } from '../../../shared/constants';
import type { AppStore } from '../../../shared/types';

defineProps<{
    isChatPage: boolean;
    isExternalPage: boolean;
    isStartPage: boolean;
    channel: string;
}>();

const emit = defineEmits(['showStart', 'showSettings', 'showChangelog', 'vanish']);

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

type EmitType = 'chat' | 'start' | 'changelog' | 'vanish';
type EmitKey = | 'showStart' | 'showSettings' | 'showChangelog' | 'vanish';

const isSettingsOpen = ref(false);

if (electronStore.get('settings').isOpen) {
    isSettingsOpen.value = true;
}

function emitAndCloseMenu(emitType: EmitType) {
    document.querySelector('details')?.removeAttribute('open');
    const emitKey = emitType === 'vanish' ? emitType : `show${emitType.charAt(0).toUpperCase() + emitType.slice(1)}`;
    emit(emitKey as EmitKey);
}

function showSettings() {
    document.querySelector('details')?.removeAttribute('open');
    isSettingsOpen.value = true;
    ipcRenderer.send(IpcEvent.OpenSettings);
}

function toggleTheme() {
    const $html = document.querySelector('html');
    const theme = $html?.getAttribute('data-theme');

    if (theme && theme === 'dark') {
        $html?.setAttribute('data-theme', 'light');
        electronStore.set('savedWindowState.theme', 'light');
        electronStore.set('settings.savedWindowState.theme', 'light');
    } else {
        $html?.setAttribute('data-theme', 'dark');
        electronStore.set('savedWindowState.theme', 'dark');
        electronStore.set('settings.savedWindowState.theme', 'dark');
    }

    ipcRenderer.send(IpcEvent.Rerender, 'child');
}
</script>

<template>
    <details
        id="app-menu"
        class="dropdown"
        role="list"
    >
        <summary
            id="menu"
            aria-haspopup="listbox"
            role="button"
            class="secondary"
        >
            <span><font-awesome-icon icon="fas fa-bars" /></span>
        </summary>
        <ul role="listbox">
            <li v-if="!isStartPage">
                <a @click="emitAndCloseMenu('start')">{{ t('header.dropdown.start') }}</a>
            </li>
            <li v-if="!isSettingsOpen">
                <a @click="showSettings">{{ t('header.dropdown.settings') }}</a>
            </li>
            <li>
                <a @click="toggleTheme">{{ t('header.dropdown.toggle-color-theme') }}</a>
            </li>
            <li>
                <a @click="emitAndCloseMenu('changelog')">{{ t('header.dropdown.changelog') }}</a>
            </li>
            <li
                v-if="!isSettingsOpen && (isChatPage || isExternalPage)"
                id="vanish"
            >
                <a @click="emitAndCloseMenu('vanish')">
                    <font-awesome-icon icon="fas fa-ghost" />
                    <span>{{ t('header.dropdown.vanish.title') }}</span>
                </a>
                <span
                    :data-tooltip="t('header.dropdown.vanish.tooltip')"
                    data-placement="bottom"
                >?</span>
            </li>
        </ul>
    </details>
</template>
