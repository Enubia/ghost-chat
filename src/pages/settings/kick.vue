<script setup lang="ts">
import type ElectronStore from 'electron-store';

import Settings from '@layouts/settings.vue';
import { ipcRenderer } from 'electron';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore, Kick } from '@shared/types';

import Editor from '@components/settings/Editor.vue';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { IpcEvent } from '@shared/constants';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const { kick } = electronStore.get('options');

const fontSize = ref(kick.fontSize);
const stroke = ref(kick.stroke);
const animate = ref(kick.animate);
const fade = ref(kick.fade);
const badges = ref(kick.badges);
const commands = ref(kick.commands);
const bots = ref(kick.bots);
const channelSuccess = ref(false);
const blacklistSuccess = ref(false);
const defaultChannel = ref(kick.defaultChannel);
const userBlacklist = ref(kick.userBlacklist);
const fadeTimeout = ref(kick.fadeTimeout);

function saveDefaultChannel() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        defaultChannel: defaultChannel.value,
    };

    electronStore.set('options.kick', data);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

function saveFontSize() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        fontSize: fontSize.value,
    };

    electronStore.set('options.kick', data);
}

function saveStroke() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        stroke: stroke.value,
    };

    electronStore.set('options.kick', data);
}

function saveAnimate() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        animate: animate.value,
    };

    electronStore.set('options.kick', data);
}

function saveFadeMessages() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        fade: fade.value,
    };

    electronStore.set('options.kick', data);
}

function saveBadges() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        badges: badges.value,
    };

    electronStore.set('options.kick', data);
}

function saveCommands() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        commands: commands.value,
    };

    electronStore.set('options.kick', data);
}

function saveBots() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        bots: bots.value,
    };

    electronStore.set('options.kick', data);
}

function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());
    const data: Kick = {
        ...electronStore.get('options').kick,
        userBlacklist: blacklist,
    };

    electronStore.set('options.kick', data);
    userBlacklist.value = blacklist;

    enableBlacklistSuccess();
}

function saveFadeTimeout() {
    const data: Kick = {
        ...electronStore.get('options').kick,
        fadeTimeout: fadeTimeout.value,
    };

    electronStore.set('options.kick', data);
}

function enableChannelSuccess() {
    channelSuccess.value = true;
    setTimeout(() => {
        channelSuccess.value = false;
    }, 2000);
}

function enableBlacklistSuccess() {
    blacklistSuccess.value = true;
    setTimeout(() => {
        blacklistSuccess.value = false;
    }, 2000);
}
</script>

<template>
    <Settings>
        <div class="flex flex-col gap-2">
            <Label for="default-channel">
                {{ t('settings.kick.default-channel.input-label') }}
            </Label>
            <Input
                id="default-channel" v-model="defaultChannel" :class="channelSuccess && 'border-green-600 border'"
                @change="saveDefaultChannel"
            />
            <small class="text-muted-foreground">{{ t('settings.kick.default-channel.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="font-size">
                {{ t('settings.kick.font-size.label') }}
            </Label>
            <Select id="font-size" v-model="fontSize" @update:model-value="saveFontSize">
                <SelectTrigger>
                    <SelectValue :placeholder="t('settings.kick.font-size.select-label')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Small">
                        {{ t('settings.kick.font-size.select-options.small') }}
                    </SelectItem>
                    <SelectItem value="Medium">
                        {{ t('settings.kick.font-size.select-options.medium') }}
                    </SelectItem>
                    <SelectItem value="Large">
                        {{ t('settings.kick.font-size.select-options.large') }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <small class="text-muted-foreground">{{ t('settings.kick.font-size.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="stroke">
                {{ t('settings.kick.stroke.label') }}
            </Label>
            <Select id="stroke" v-model="stroke" @update:model-value="saveStroke">
                <SelectTrigger>
                    <SelectValue :placeholder="t('settings.kick.stroke.select-label')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Off">
                        {{ t('settings.kick.stroke.select-options.off') }}
                    </SelectItem>
                    <SelectItem value="Thin">
                        {{ t('settings.kick.stroke.select-options.thin') }}
                    </SelectItem>
                    <SelectItem value="Medium">
                        {{ t('settings.kick.stroke.select-options.medium') }}
                    </SelectItem>
                    <SelectItem value="Thick">
                        {{ t('settings.kick.stroke.select-options.thick') }}
                    </SelectItem>
                    <SelectItem value="Thicker">
                        {{ t('settings.kick.stroke.select-options.thicker') }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <small class="text-muted-foreground">{{ t('settings.kick.stroke.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="animate" v-model:checked="animate" @update:checked="saveAnimate" />
                <Label class="align-elements" for="animate">
                    {{ t('settings.kick.animate.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.kick.animate.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Switch id="fade" v-model:checked="fade" @update:checked="saveFadeMessages" />
                    <Label class="cursor-pointer" for="fade">
                        {{ t('settings.kick.fade.label') }}
                    </Label>
                </div>
                <div v-if="fade">
                    <Label class="cursor-pointer" for="fade">
                        {{ t('settings.kick.fade.timeout-label', { seconds: fadeTimeout }) }}
                    </Label>
                    <Input v-model="fadeTimeout" class="w-30 text-center" type="number" @change="saveFadeTimeout" />
                </div>
            </div>
            <small class="text-muted-foreground">{{ t('settings.kick.fade.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="hide-badges" v-model:checked="badges" @update:checked="saveBadges" />
                <Label class="align-elements" for="hide-badges">
                    {{ t('settings.kick.hide-badges.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.kick.hide-badges.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="hide-commands" v-model:checked="commands" @update:checked="saveCommands" />
                <Label class="align-elements" for="hide-commands">
                    {{ t('settings.kick.hide-commands.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.kick.hide-commands.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="hide-bots" v-model:checked="bots" @update:checked="saveBots" />
                <Label class="align-elements" for="hide-bots">
                    {{ t('settings.kick.hide-bots.label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.kick.hide-bots.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="user-blacklist">
                {{ t('settings.kick.user-blacklist.label') }}
            </Label>
            <Input
                id="user-blacklist" :default-value="userBlacklist.join(', ')"
                :class="blacklistSuccess && 'border-green-600 border'" @change="updateBlacklist"
            />
            <small class="text-muted-foreground">{{ t('settings.kick.user-blacklist.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="css-editor">
                {{ t('settings.kick.css-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.kick.css-editor.info') }}</small>
            <Editor id="css-editor" type="kick" :css="kick.css" />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.kick.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.kick.js-editor.info') }}</small>
            <Editor id="js-editor" type="kick" :js="kick.js" />
        </div>
    </Settings>
</template>
