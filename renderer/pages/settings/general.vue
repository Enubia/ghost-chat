<script setup lang="ts">
import type { Keybinds } from '#ipc/types/store';

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
const vanish = shallowRef<Keybinds['vanish']>(StoreDefaults.keybinds.vanish);
const showMacOptions = shallowRef(false);
const rerenderKey = shallowRef(0);

onMounted(async () => {
    const updater = await IpcHandler.getUpdater();
    const mac = await IpcHandler.getValueFromKey('general.mac');

    showMacOptions.value = await IpcHandler.getPlatform() === 'darwin';
    vanish.value = (await IpcHandler.getKeybinds()).vanish;

    if (updater.channel !== 'latest') {
        participateInPreRelease.value = true;
    }

    quitOnClose.value = mac.quitOnClose;
    hideDockIcon.value = mac.hideDockIcon;

    rerenderKey.value++;
});

async function saveKeybind(value: string | null) {
    await IpcHandler.setKeyValue('keybinds.vanish.keybind', value);
    ipcRenderer.send(IpcEvent.RegisterNewKeybind);
}

async function savePrerelease(value: boolean) {
    await IpcHandler.setKeyValue('updater.channel', value ? 'beta' : 'latest');
    participateInPreRelease.value = value;
}

async function saveLanguage(value: string) {
    await IpcHandler.setKeyValue('general.language', value);
}
</script>

<template>
    <Settings :key="rerenderKey">
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

        <HotKeyInput v-model="vanish.keybind" @update:keyup="saveKeybind" />

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
                    id="quit-one-close" :default-checked="quitOnClose"
                    @update:checked="(checked) => IpcHandler.setKeyValue('general.mac.quitOnClose', checked)"
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
                    @update:checked="(checked) => IpcHandler.setKeyValue('general.mac.hideDockIcon', checked)"
                />
                <Label for="hide-dock-icon">
                    {{ t('settings.general.hide-dock-icon-options.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.general.hide-dock-icon-options.info') }}</small>
        </div>
    </Settings>
</template>
