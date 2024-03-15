<script setup lang="ts">
import { ipcRenderer } from 'electron';
import type ElectronStore from 'electron-store';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';
import { languageMappingList } from '../languageMappingList';

import HotKeyInput from './HotKeyInput.vue';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const updater = electronStore.get('updater');
const mac = electronStore.get('general').mac;
// const storedExternanlBrowserSources = electronStore.get('general').externalBrowserSources;
const keybind = electronStore.get('keybind').vanishKeybind;

const participateInPreRelease = ref(false);
const disableAutoUpdate = ref(updater.disableAutoUpdate);
const updaterStatus = ref({ status: '', message: '' });
const quitOnClose = ref(mac.quitOnClose);
const hideDockIcon = ref(mac.hideDockIcon);
// const externalBrowserSources = ref(storedExternanlBrowserSources);
const vanishKeybind = ref(keybind);

const showMacOptions = process.platform === 'darwin';

if (updater.channel !== 'latest') {
    participateInPreRelease.value = true;
}

function saveKeybind(value: string) {
    electronStore.set('keybind.vanishKeybind', value);
    ipcRenderer.send(IpcEvent.RegisterNewKeybind);
}

function checkForUpdates() {
    updaterStatus.value = { status: 'checking', message: t('settings.document.general.auto-updates.checking') };
    ipcRenderer.send(IpcEvent.CheckForUpdates);
}

ipcRenderer.on(IpcEvent.Error, () => {
    console.log('Error');
    updaterStatus.value = { status: 'error', message: t('settings.document.general.auto-updates.error') };
});

ipcRenderer.on(IpcEvent.UpdateDownloaded, () => {
    console.log('Update downloaded');
    updaterStatus.value = { status: 'update-downloaded', message: t('settings.document.general.auto-updates.update-downloaded') };
});

ipcRenderer.on(IpcEvent.UpdateNotAvailable, () => {
    console.log('Update not available');
    updaterStatus.value = { status: 'update-not-available', message: t('settings.document.general.auto-updates.update-not-available') };
});

ipcRenderer.on(IpcEvent.UpdateAvailable, () => {
    console.log('Update available');
    updaterStatus.value = { status: 'update-available', message: t('settings.document.general.auto-updates.update-available') };
});
</script>

<template>
    <div id="locale-changer">
        <label for="locale-change-select">
            {{ t('settings.document.general.locale-change.label') }}
            <select
                v-model="$i18n.locale"
                @change="electronStore.set('general.language', $i18n.locale)"
            >
                <option
                    v-for="locale in $i18n.availableLocales"
                    :key="`locale-${locale}`"
                    :value="locale"
                >
                    {{ languageMappingList[locale].nativeName }}
                </option>
            </select>
        </label>
        <div />
        <small
            v-if="electronStore.get('general.language') !== $i18n.locale"
            class="info"
        >
            {{ t('settings.document.general.locale-change.info') }}
        </small>
    </div>
    <hr>
    <HotKeyInput
        :model-value="vanishKeybind"
        @update:model-value="saveKeybind"
    />
    <hr>
    <div id="beta-updates">
        <label
            for="beta-updates-input"
            class="align-elements"
        >
            <input
                id="beta-updates-input"
                v-model="participateInPreRelease"
                type="checkbox"
                role="switch"
                @change="electronStore.set('updater.channel', participateInPreRelease ? 'beta' : 'latest')"
            >
            <span>{{ t('settings.document.general.pre-release.checkbox-label') }}</span>
        </label>
        <small>
            {{ t('settings.document.general.pre-release.info') }}
        </small>
    </div>
    <hr>
    <div id="auto-updates">
        <div id="disable-auto-updates">
            <label
                for="disable-auto-updates-input"
                class="align-elements"
            >
                <input
                    id="disable-auto-updates-input"
                    v-model="disableAutoUpdate"
                    type="checkbox"
                    role="switch"
                    @click="electronStore.set('updater.disableAutoUpdate', true)"
                >
                <span>
                    {{ t('settings.document.general.auto-updates.disable-label') }}
                </span>
            </label>
            <small v-if="disableAutoUpdate">
                {{ t('settings.document.general.auto-updates.disable-info') }}
            </small>
        </div>
        <div v-if="disableAutoUpdate" id="check-for-updates">
            <hr>
            <div class="center-elements">
                <button
                    class="outline"
                    :aria-busy="updaterStatus.status === 'checking' || updaterStatus.status === 'update-available'"
                    :disabled="updaterStatus.status === 'checking' || updaterStatus.status === 'update-available'"
                    @click="checkForUpdates"
                >
                    Check for updates
                </button>
            </div>
            <small>
                {{ updaterStatus.message }}
            </small>
        </div>
    </div>
    <hr>
    <div v-if="showMacOptions">
        <div id="close-option">
            <label
                for="close-option-input"
                class="align-elements"
            >
                <input
                    id="close-option-input"
                    v-model="quitOnClose"
                    type="checkbox"
                    role="switch"
                    @change="electronStore.set('general.mac.quitOnClose', quitOnClose)"
                >
                <span>{{ t('settings.document.general.close-option.checkbox-label') }}</span>
            </label>
            <small>{{ t('settings.document.general.close-option.info') }}</small>
        </div>
        <hr>
        <div id="hide-dock-icon-options">
            <label
                for="hide-dock-icon-options-input"
                class="align-elements"
            >
                <input
                    id="hide-dock-icon-options-input"
                    v-model="hideDockIcon"
                    type="checkbox"
                    role="switch"
                    @change="electronStore.set('general.mac.hideDockIcon', hideDockIcon)"
                >
                <span>{{ t('settings.document.general.hide-dock-icon-options.checkbox-label') }}</span>
            </label>
            <small>{{ t('settings.document.general.hide-dock-icon-options.info') }}</small>
        </div>
    </div>
</template>
