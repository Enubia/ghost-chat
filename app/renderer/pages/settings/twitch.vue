<script setup lang="ts">
import type { Twitch } from '#ipc/types/store';

import { ipcRenderer } from 'electron';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Editor from '#components/settings/Editor.vue';
import JChat from '#components/settings/twitch/JChat.vue';
import KapChat from '#components/settings/twitch/KapChat.vue';
import { Input } from '#components/ui/input';
import { Label } from '#components/ui/label';
import Switch from '#components/ui/switch/Switch.vue';
import { IpcEvent } from '#ipc/constants/events';
import { StoreDefaults } from '#ipc/constants/store/defaults';
import Settings from '#layouts/settings.vue';
import IpcHandler from '#lib/ipchandler';

const { t, rt, tm } = useI18n();

const fontOptions = [] as string[];

for (const [_, value] of Object.entries(tm('settings.twitch.font.select-options'))) {
    fontOptions.push(rt(value));
}

const useJChat = shallowRef(StoreDefaults.options.twitch.useJChat);
const fontSize = shallowRef(StoreDefaults.options.twitch.fontSize.toString());
const userBlacklist = shallowRef(StoreDefaults.options.twitch.userBlacklist);
const defaultChannel = shallowRef(StoreDefaults.options.twitch.defaultChannel);
const animate = shallowRef(StoreDefaults.options.twitch.animate);
const fade = shallowRef(StoreDefaults.options.twitch.fade);
const bots = shallowRef(StoreDefaults.options.twitch.bots);
const hideCommands = shallowRef(StoreDefaults.options.twitch.hideCommands);
const hideBadges = shallowRef(StoreDefaults.options.twitch.hideBadges);
const font = shallowRef(StoreDefaults.options.twitch.font.toString());
const stroke = shallowRef(StoreDefaults.options.twitch.stroke.toString());
const shadow = shallowRef(StoreDefaults.options.twitch.shadow.toString());
const smallCaps = shallowRef(StoreDefaults.options.twitch.smallCaps);
const fadeTimeout = shallowRef(StoreDefaults.options.twitch.fadeTimeout);
// KapChat specific options
const theme = shallowRef(StoreDefaults.options.twitch.theme);
const preventClipping = shallowRef(StoreDefaults.options.twitch.preventClipping);
const fontSizeExact = shallowRef(StoreDefaults.options.twitch.fontSizeExact);

const jChatRerenderKey = shallowRef(0);
const kapChatRerenderKey = shallowRef(0);

onMounted(async () => {
    const twitch = await IpcHandler.getTwitchOptions();

    useJChat.value = twitch.useJChat;
    fontSize.value = twitch.fontSize.toString();
    userBlacklist.value = twitch.userBlacklist;
    defaultChannel.value = twitch.defaultChannel;
    animate.value = twitch.animate;
    fade.value = twitch.fade;
    bots.value = twitch.bots;
    hideCommands.value = twitch.hideCommands;
    hideBadges.value = twitch.hideBadges;
    font.value = twitch.font.toString();
    stroke.value = twitch.stroke.toString();
    shadow.value = twitch.shadow.toString();
    smallCaps.value = twitch.smallCaps;
    fadeTimeout.value = twitch.fadeTimeout;
    theme.value = twitch.theme;
    preventClipping.value = twitch.preventClipping;
    fontSizeExact.value = twitch.fontSizeExact;

    jChatRerenderKey.value++;
    kapChatRerenderKey.value++;
});

const channelSuccess = shallowRef(false);
const blacklistSuccess = shallowRef(false);

async function saveDefaultChannel() {
    await IpcHandler.setKeyValue('options.twitch.defaultChannel', defaultChannel.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

async function saveUseJChat(value: boolean) {
    await IpcHandler.setKeyValue('options.twitch.useJChat', value);
}

async function saveAnimate(value: boolean) {
    await IpcHandler.setKeyValue('options.twitch.animate', value);
}

async function saveFadeMessages(value: boolean) {
    fade.value = value;
    await IpcHandler.setKeyValue('options.twitch.fade', value);
}

async function saveShowBotActivity(value: boolean) {
    await IpcHandler.setKeyValue('options.twitch.bots', value);
}

async function saveHideCommands(value: boolean) {
    await IpcHandler.setKeyValue('options.twitch.hideCommands', value);
}

async function saveHideBadges(value: boolean) {
    await IpcHandler.setKeyValue('options.twitch.hideBadges', value);
}

async function saveFont(value: string) {
    await IpcHandler.setKeyValue('options.twitch.font', Number.parseInt(value) as Twitch['font']);
}

async function saveStroke(value: string) {
    let valueToSave: Twitch['stroke'];

    switch (value) {
        case 'false':
            valueToSave = false;
            break;
        default:
            valueToSave = Number.parseInt(value) as Twitch['stroke'];
            break;
    }

    await IpcHandler.setKeyValue('options.twitch.stroke', valueToSave);
}

async function saveShadow(value: string) {
    let valueToSave: Twitch['shadow'];

    switch (value) {
        case 'false':
            valueToSave = false;
            break;
        default:
            valueToSave = Number.parseInt(value) as Twitch['shadow'];
            break;
    }

    await IpcHandler.setKeyValue('options.twitch.shadow', valueToSave);
}

async function saveSmallCaps(value: boolean) {
    await IpcHandler.setKeyValue('options.twitch.smallCaps', value);
}

async function saveFontSize(value: string) {
    await IpcHandler.setKeyValue('options.twitch.fontSize', Number.parseInt(value) as Twitch['fontSize']);
}

async function saveTheme(value: string) {
    await IpcHandler.setKeyValue('options.twitch.theme', value);
}

async function savePreventClipping(value: boolean) {
    await IpcHandler.setKeyValue('options.twitch.preventClipping', value);
}

async function saveFontSizeExact(value: number) {
    await IpcHandler.setKeyValue('options.twitch.fontSizeExact', value);
}

async function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());

    await IpcHandler.setKeyValue('options.twitch.userBlacklist', blacklist);
    userBlacklist.value = blacklist;

    enableBlacklistSuccess();
}

async function saveFadeTimeout(value: number) {
    if (fade.value) {
        await IpcHandler.setKeyValue('options.twitch.fadeTimeout', value);
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
                {{ t('settings.twitch.default-channel.input-label') }}
            </Label>
            <Input
                id="default-channel" v-model="defaultChannel" :class="channelSuccess && 'border-green-600 border'"
                @change="saveDefaultChannel"
            />
            <small class="text-muted-foreground">{{ t('settings.twitch.default-channel.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="theme">
                {{ t('settings.twitch.chat-selector.label') }}
            </Label>
            <Switch v-model:checked="useJChat" @update:checked="saveUseJChat" />
            <small>{{ t('settings.twitch.chat-selector.info') }}</small>
        </div>

        <JChat
            v-if="useJChat"
            :key="jChatRerenderKey"
            :animate="animate"
            :fade="fade"
            :bots="bots"
            :hide-commands="hideCommands"
            :hide-badges="hideBadges"
            :font="font"
            :stroke="stroke"
            :shadow="shadow"
            :small-caps="smallCaps"
            :font-size="fontSize"
            :fade-timeout="fadeTimeout"
            @update:animate="saveAnimate"
            @update:fade="saveFadeMessages"
            @update:bots="saveShowBotActivity"
            @update:hide-commands="saveHideCommands"
            @update:hide-badges="saveHideBadges"
            @update:font="saveFont"
            @update:stroke="saveStroke"
            @update:shadow="saveShadow"
            @update:small-caps="saveSmallCaps"
            @update:font-size="saveFontSize"
            @update:fade-timeout="saveFadeTimeout"
        />

        <KapChat
            v-else
            :key="kapChatRerenderKey"
            :theme="theme"
            :prevent-clipping="preventClipping"
            :fade="fade"
            :bots="bots"
            :font-size-exact="fontSizeExact"
            :fade-timeout="fadeTimeout"
            @update:theme="saveTheme"
            @update:prevent-clipping="savePreventClipping"
            @update:fade="saveFadeMessages"
            @update:bots="saveShowBotActivity"
            @update:font-size-exact="saveFontSizeExact"
            @update:fade-timeout="saveFadeTimeout"
        />

        <div class="flex flex-col gap-2">
            <Label for="user-blacklist">
                {{ t('settings.twitch.user-blacklist.label') }}
            </Label>
            <Input
                id="user-blacklist" :model-value="userBlacklist.join(', ')"
                :class="blacklistSuccess && 'border-green-600 border'" @change="updateBlacklist"
            />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="css-editor">
                {{ t('settings.twitch.css-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.twitch.css-editor.info') }}</small>
            <Editor id="css-editor" option="twitch" type="css" />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.twitch.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.twitch.js-editor.info') }}</small>
            <Editor id="js-editor" option="twitch" type="js" />
        </div>
    </Settings>
</template>
