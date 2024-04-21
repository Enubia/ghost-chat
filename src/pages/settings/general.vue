<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { Icon } from '@iconify/vue';
import Settings from '@layouts/settings.vue';
import { ipcRenderer } from 'electron';
import { inject, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import { languageMappingList } from '@components/languageMappingList';
import HotKeyInput from '@components/settings/HotKeyInput.vue';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { IpcEvent } from '@shared/constants';

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

function saveAutoUpdateSetting(value: boolean) {
    electronStore.set('updater.disableAutoUpdates', value);
    disableAutoUpdates.value = value;

    if (!value) {
        updaterStatus.value = 'init';
    }
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

// Cleanup, otherwise we'll have memory leaks (MaxListenersExceededWarning)
onUnmounted(() => {
    ipcRenderer.removeAllListeners(IpcEvent.Error);
    ipcRenderer.removeAllListeners(IpcEvent.UpdateDownloaded);
    ipcRenderer.removeAllListeners(IpcEvent.UpdateNotAvailable);
    ipcRenderer.removeAllListeners(IpcEvent.UpdateAvailable);
    ipcRenderer.removeAllListeners(IpcEvent.ManualUpdateRequired);
});
</script>

<template>
    <Settings>
        <div>
            <Label for="locale-switcher">
                {{ t('settings.general.locale-change.label') }}
            </Label>
            <Select
                id="locale-switcher" v-model="$i18n.locale"
                @update:model-value="electronStore.set('general.language', $i18n.locale)"
            >
                <SelectTrigger>
                    <SelectValue :placeholder="$i18n.locale" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
                        {{ languageMappingList[locale].nativeName }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <HotKeyInput :model-value="vanishKeybind" @update:model-value="saveKeybind" />
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch
                    id="beta-updates" :default-checked="participateInPreRelease"
                    @update:checked="(checked) => electronStore.set('updater.channel', checked ? 'beta' : 'latest')"
                />
                <Label for="beta-updates" class="cursor-pointer">
                    {{ t('settings.general.pre-release.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">
                {{ t('settings.general.pre-release.info') }}
            </small>
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch
                    id="disable-auto-updates" :default-checked="disableAutoUpdates"
                    @update:checked="saveAutoUpdateSetting"
                />
                <Label for="disable-auto-updates" class="cursor-pointer">
                    {{ t('settings.general.auto-updates.disable-label') }}
                </Label>
            </div>
            <small v-if="!disableAutoUpdates" class="text-muted-foreground">
                {{ t('settings.general.auto-updates.disable-info') }}
            </small>
            <div v-if="disableAutoUpdates" class="flex flex-col">
                <Button
                    :disabled="updaterStatus === 'checking' || updaterStatus === 'update-available'"
                    v-on="{ click: updaterStatus === 'update-downloaded' ? restart : checkForUpdates }"
                >
                    {{ t(`settings.general.auto-updates.button.${updaterStatus}`) }}
                    <Icon
                        v-if="updaterStatus === 'checking' || updaterStatus === 'update-available'" class="ms-2"
                        icon="svg-spinners:270-ring"
                    />
                </Button>
                <small v-if="updaterStatus === 'manual-update-required'">
                    {{ t('settings.general.auto-updates.manual-update-required.before-link') }}
                    <a href="https://github.com/Enubia/ghost-chat/releases">
                        {{ t('settings.general.auto-updates.manual-update-required.link') }}
                    </a>
                    {{ t('settings.general.auto-updates.manual-update-required.after-link') }}
                </small>
                <small v-else-if="updaterStatus !== ''">
                    {{ t(`settings.general.auto-updates.${updaterStatus}`) }}
                </small>
            </div>
        </div>
        <div v-if="showMacOptions" class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch
                    id="quit-one-close" :default-checked="quitOnClose"
                    @update:checked="(checked) => electronStore.set('general.mac.quitOnClose', checked)"
                />
                <Label for="quit-one-close">
                    {{ t('settings.general.close-option.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.general.close-option.info') }}</small>
        </div>
        <div v-if="showMacOptions" class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch
                    id="hide-dock-icon" :default-checked="hideDockIcon"
                    @update:checked="(checked) => electronStore.set('general.mac.hideDockIcon', checked)"
                />
                <Label for="hide-dock-icon">
                    {{ t('settings.general.hide-dock-icon-options.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.general.hide-dock-icon-options.info') }}</small>
        </div>
    </Settings>
</template>