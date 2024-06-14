<script setup lang="ts">
import Settings from '@layouts/settings.vue';
import { ipcRenderer } from 'electron';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Twitch } from '@shared/types';

import Editor from '@components/settings/Editor.vue';
import JChat from '@components/settings/twitch/JChat.vue';
import KapChat from '@components/settings/twitch/KapChat.vue';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import Switch from '@components/ui/switch/Switch.vue';
import IpcHandler from '@lib/ipchandler';
import { IpcEvent, StoreDefaults } from '@shared/constants';

const { t, rt, tm } = useI18n();

const fontOptions = [] as string[];

for (const [_, value] of Object.entries(tm('settings.twitch.font.select-options'))) {
    fontOptions.push(rt(value));
}

const useJChat = ref(StoreDefaults.options.twitch.useJChat);
const fontSize = ref(String(StoreDefaults.options.twitch.fontSize));
const userBlacklist = ref(StoreDefaults.options.twitch.userBlacklist);
const defaultChannel = ref(StoreDefaults.options.twitch.defaultChannel);
const animate = ref(StoreDefaults.options.twitch.animate);
const fade = ref(StoreDefaults.options.twitch.fade);
const bots = ref(StoreDefaults.options.twitch.bots);
const hideCommands = ref(StoreDefaults.options.twitch.hideCommands);
const hideBadges = ref(StoreDefaults.options.twitch.hideBadges);
const font = ref(String(StoreDefaults.options.twitch.font));
const stroke = ref(String(StoreDefaults.options.twitch.stroke));
const shadow = ref(String(StoreDefaults.options.twitch.shadow));
const smallCaps = ref(StoreDefaults.options.twitch.smallCaps);
const fadeTimeout = ref(StoreDefaults.options.twitch.fadeTimeout);
// KapChat specific options
const theme = ref(StoreDefaults.options.twitch.theme);
const preventClipping = ref(StoreDefaults.options.twitch.preventClipping);
const fontSizeExact = ref(StoreDefaults.options.twitch.fontSizeExact);

const jChatRerenderKey = ref(0);
const kapChatRerenderKey = ref(0);

onMounted(async () => {
    const twitch = await IpcHandler.getTwitchOptions();

    useJChat.value = twitch.useJChat;
    fontSize.value = String(twitch.fontSize);
    userBlacklist.value = twitch.userBlacklist;
    defaultChannel.value = twitch.defaultChannel;
    animate.value = twitch.animate;
    fade.value = twitch.fade;
    bots.value = twitch.bots;
    hideCommands.value = twitch.hideCommands;
    hideBadges.value = twitch.hideBadges;
    font.value = String(twitch.font);
    stroke.value = String(twitch.stroke);
    shadow.value = String(twitch.shadow);
    smallCaps.value = twitch.smallCaps;
    fadeTimeout.value = twitch.fadeTimeout;
    theme.value = String(twitch.theme);
    preventClipping.value = twitch.preventClipping;

    jChatRerenderKey.value++;
    kapChatRerenderKey.value++;
});

const channelSuccess = ref(false);
const blacklistSuccess = ref(false);

async function saveDefaultChannel() {
    await IpcHandler.setValueFromKey('options.twitch.defaultChannel', defaultChannel.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

async function saveUseJChat(value: boolean) {
    await IpcHandler.setValueFromKey('options.twitch.useJChat', value);
}

async function saveAnimate(value: boolean) {
    await IpcHandler.setValueFromKey('options.twitch.animate', value);
}

async function saveFadeMessages(value: boolean) {
    fade.value = value;
    await IpcHandler.setValueFromKey('options.twitch.fade', value);
}

async function saveShowBotActivity(value: boolean) {
    await IpcHandler.setValueFromKey('options.twitch.bots', value);
}

async function saveHideCommands(value: boolean) {
    await IpcHandler.setValueFromKey('options.twitch.hideCommands', value);
}

async function saveHideBadges(value: boolean) {
    await IpcHandler.setValueFromKey('options.twitch.hideBadges', value);
}

async function saveFont(value: string) {
    await IpcHandler.setValueFromKey('options.twitch.font', Number.parseInt(value) as Twitch['font']);
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

    await IpcHandler.setValueFromKey('options.twitch.stroke', valueToSave);
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

    await IpcHandler.setValueFromKey('options.twitch.shadow', valueToSave);
}

async function saveSmallCaps(value: boolean) {
    await IpcHandler.setValueFromKey('options.twitch.smallCaps', value);
}

async function saveFontSize(value: string) {
    await IpcHandler.setValueFromKey('options.twitch.fontSize', Number.parseInt(value) as Twitch['fontSize']);
}

async function saveTheme(value: string) {
    await IpcHandler.setValueFromKey('options.twitch.theme', value);
}

async function savePreventClipping(value: boolean) {
    await IpcHandler.setValueFromKey('options.twitch.preventClipping', value);
}

async function saveFontSizeExact(value: number) {
    await IpcHandler.setValueFromKey('options.twitch.fontSizeExact', value);
}

async function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());

    await IpcHandler.setValueFromKey('options.twitch.userBlacklist', blacklist);
    userBlacklist.value = blacklist;

    enableBlacklistSuccess();
}

async function saveFadeTimeout(value: number) {
    if (fade.value) {
        await IpcHandler.setValueFromKey('options.twitch.fadeTimeout', value);
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
        </div>
    </Settings>
</template>
