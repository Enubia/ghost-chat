<script setup lang="ts">
import type { FontSize, Stroke } from '#shared/types';

import { ipcRenderer } from 'electron';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Editor from '#components/settings/Editor.vue';
import { Input } from '#components/ui/input';
import { Label } from '#components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select';
import { Switch } from '#components/ui/switch';
import Settings from '#layouts/settings.vue';
import IpcHandler from '#lib/ipchandler';
import { IpcEvent, StoreDefaults } from '#shared/constants';

const { t } = useI18n();

const kickDefaults = StoreDefaults.options.kick;
const fontSize = ref(kickDefaults.fontSize);
const stroke = ref(kickDefaults.stroke);
const animate = ref(kickDefaults.animate);
const fade = ref(kickDefaults.fade);
const badges = ref(kickDefaults.badges);
const commands = ref(kickDefaults.commands);
const bots = ref(kickDefaults.bots);
const channelSuccess = ref(false);
const blacklistSuccess = ref(false);
const defaultChannel = ref(kickDefaults.defaultChannel);
const userBlacklist = ref(kickDefaults.userBlacklist);
const fadeTimeout = ref(kickDefaults.fadeTimeout);

onMounted(async () => {
    const kickStore = await IpcHandler.getKickOptions();

    fontSize.value = kickStore.fontSize;
    stroke.value = kickStore.stroke;
    animate.value = kickStore.animate;
    fade.value = kickStore.fade;
    badges.value = kickStore.badges;
    commands.value = kickStore.commands;
    bots.value = kickStore.bots;
    defaultChannel.value = kickStore.defaultChannel;
    userBlacklist.value = kickStore.userBlacklist;
    fadeTimeout.value = kickStore.fadeTimeout;
});

async function saveDefaultChannel(value: string) {
    await IpcHandler.setValueFromKey('options.kick.defaultChannel', value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

async function saveFontSize(value: string) {
    await IpcHandler.setValueFromKey('options.kick.fontSize', value as FontSize);
}

async function saveStroke(value: string) {
    await IpcHandler.setValueFromKey('options.kick.stroke', value as Stroke);
}

async function saveAnimate(value: boolean) {
    await IpcHandler.setValueFromKey('options.kick.animate', value);
}

async function saveFadeMessages(value: boolean) {
    await IpcHandler.setValueFromKey('options.kick.fade', value);
}

async function saveBadges(value: boolean) {
    await IpcHandler.setValueFromKey('options.kick.badges', value);
}

async function saveCommands(value: boolean) {
    await IpcHandler.setValueFromKey('options.kick.commands', value);
}

async function saveBots(value: boolean) {
    await IpcHandler.setValueFromKey('options.kick.bots', value);
}

async function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());

    await IpcHandler.setValueFromKey('options.kick.userBlacklist', blacklist);
    userBlacklist.value = blacklist;

    enableBlacklistSuccess();
}

async function saveFadeTimeout(value: string | number) {
    if (fade.value) {
        await IpcHandler.setValueFromKey('options.kick.fadeTimeout', Number.parseInt(value as string));
    }
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
                    <Label class="cursor-pointer" for="fadeTimeout">
                        {{ t('settings.kick.fade.timeout-label', { seconds: fadeTimeout }) }}
                    </Label>
                    <Input
                        id="fadeTimeout" v-model="fadeTimeout" class="w-30 text-center" type="number"
                        @update:model-value="saveFadeTimeout"
                    />
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
                id="user-blacklist" :model-value="userBlacklist.join(', ')"
                :class="blacklistSuccess && 'border-green-600 border'" @change="updateBlacklist"
            />
            <small class="text-muted-foreground">{{ t('settings.kick.user-blacklist.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="css-editor">
                {{ t('settings.kick.css-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.kick.css-editor.info') }}</small>
            <Editor id="css-editor" option="kick" type="css" />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.kick.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.kick.js-editor.info') }}</small>
            <Editor id="js-editor" option="kick" type="js" />
        </div>
    </Settings>
</template>
