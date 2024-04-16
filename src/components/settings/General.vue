<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { ipcRenderer } from 'electron';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import { IpcEvent } from '@shared/constants';

import { languageMappingList } from '../languageMappingList';
import HotKeyInput from './HotKeyInput.vue';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const updater = electronStore.get('updater');
const mac = electronStore.get('general').mac;
const keybind = electronStore.get('keybind').vanishKeybind;

const participateInPreRelease = ref(false);
const disableAutoUpdates = ref(updater.disableAutoUpdates);
const updaterStatus = ref('init');
const quitOnClose = ref(mac.quitOnClose);
const hideDockIcon = ref(mac.hideDockIcon);
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
    updaterStatus.value = 'checking';
    ipcRenderer.send(IpcEvent.CheckForUpdates);
}

function restart() {
    ipcRenderer.send(IpcEvent.Close);
}

ipcRenderer.on(IpcEvent.Error, () => {
    updaterStatus.value = 'error';
});

ipcRenderer.on(IpcEvent.UpdateDownloaded, () => {
    updaterStatus.value = 'update-downloaded';
});

ipcRenderer.on(IpcEvent.UpdateNotAvailable, () => {
    updaterStatus.value = 'update-not-available';
});

ipcRenderer.on(IpcEvent.UpdateAvailable, () => {
    updaterStatus.value = 'update-available';
});

ipcRenderer.on(IpcEvent.ManualUpdateRequired, () => {
    updaterStatus.value = 'manual-update-required';
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
                    v-model="disableAutoUpdates"
                    type="checkbox"
                    role="switch"
                    @change="electronStore.set('updater.disableAutoUpdates', disableAutoUpdates)"
                >
                <span>
                    {{ t('settings.document.general.auto-updates.disable-label') }}
                </span>
            </label>
            <small v-if="!disableAutoUpdates">
                {{ t('settings.document.general.auto-updates.disable-info') }}
            </small>
        </div>
        <div v-if="disableAutoUpdates" id="check-for-updates" class="text-center">
            <hr>
            <div class="center-elements">
                <button
                    class="outline"
                    :aria-busy="updaterStatus === 'checking' || updaterStatus === 'update-available'"
                    :disabled="updaterStatus === 'checking' || updaterStatus === 'update-available'"
                    v-on="{ click: updaterStatus === 'update-downloaded' ? restart : checkForUpdates }"
                >
                    {{ t(`settings.document.general.auto-updates.button.${updaterStatus}`) }}
                </button>
            </div>
            <small v-if="updaterStatus === 'manual-update-required'">
                {{ t('settings.document.general.auto-updates.manual-update-required.before-link') }}
                <a href="https://github.com/Enubia/ghost-chat/releases">
                    {{ t('settings.document.general.auto-updates.manual-update-required.link') }}
                </a>
                {{ t('settings.document.general.auto-updates.manual-update-required.after-link') }}
            </small>
            <small v-else-if="updaterStatus !== ''">
                {{ t(`settings.document.general.auto-updates.${updaterStatus}`) }}
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
