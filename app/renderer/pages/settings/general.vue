<script setup lang="ts">
import { useIpcRenderer } from '@vueuse/electron';
import { ipcRenderer } from 'electron';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { languageMappingList } from '#components/languageMappingList';
import HotKeyInput from '#components/settings/HotKeyInput.vue';
import { Label } from '#components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select';
import { Switch } from '#components/ui/switch';
import { IpcEvent } from '#ipc/constants/events';
import { StoreDefaults } from '#ipc/constants/store/defaults';
import Settings from '#layouts/settings.vue';
import IpcHandler from '#lib/ipchandler';

const { t } = useI18n();

const participateInPreRelease = shallowRef(StoreDefaults.updater.channel === 'beta');
const quitOnClose = shallowRef(StoreDefaults.general.mac.quitOnClose);
const hideDockIcon = shallowRef(StoreDefaults.general.mac.hideDockIcon);
const vanishKeybind = shallowRef<string | null>(StoreDefaults.keybinds.vanish.keybind);
const showMacOptions = shallowRef(false);

onMounted(async () => {
    const updater = await IpcHandler.getUpdater();
    const mac = await IpcHandler.getValueFromKey('general.mac');

    showMacOptions.value = await IpcHandler.getPlatform() === 'darwin';
    vanishKeybind.value = (await IpcHandler.getKeybinds()).vanish.keybind;

    if (updater.channel !== 'latest') {
        participateInPreRelease.value = true;
    }

    quitOnClose.value = mac.quitOnClose;
    hideDockIcon.value = mac.hideDockIcon;
});

async function saveKeybind(value: string | null) {
    await IpcHandler.setKeyValue('keybinds.vanish.keybind', value);
    ipcRenderer.send(IpcEvent.RegisterNewKeybind);
}

async function saveLanguage(value: string) {
    await IpcHandler.setKeyValue('general.language', value);
    useIpcRenderer().send(IpcEvent.Rerender, 'parent');
}

async function savePrerelease(value: boolean) {
    await IpcHandler.setKeyValue('updater.channel', value ? 'beta' : 'latest');
    participateInPreRelease.value = value;
}

async function saveQuitOnClose(value: boolean) {
    await IpcHandler.setKeyValue('general.mac.quitOnClose', value);
    quitOnClose.value = value;
}

async function saveHideDockIcon(value: boolean) {
    await IpcHandler.setKeyValue('general.mac.hideDockIcon', value);
    hideDockIcon.value = value;
}
</script>

<template>
    <Settings>
        <div class="flex flex-col gap-2">
            <Label for="locale-switcher">
                {{ t('settings.general.locale-change.label') }}
            </Label>
            <Select id="locale-switcher" v-model="$i18n.locale" @update:model-value="saveLanguage">
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

        <HotKeyInput v-model="vanishKeybind" @update:keyup="saveKeybind" />

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="beta-updates" :checked="participateInPreRelease" @update:checked="savePrerelease" />
                <Label for="beta-updates" class="cursor-pointer">
                    {{ t('settings.general.pre-release.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">
                {{ t('settings.general.pre-release.info') }}
            </small>
        </div>

        <div v-if="showMacOptions" class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch
                    id="quit-one-close" :checked="quitOnClose"
                    @update:checked="saveQuitOnClose"
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
                    id="hide-dock-icon" :checked="hideDockIcon"
                    @update:checked="saveHideDockIcon"
                />
                <Label for="hide-dock-icon">
                    {{ t('settings.general.hide-dock-icon-options.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.general.hide-dock-icon-options.info') }}</small>
        </div>
    </Settings>
</template>
