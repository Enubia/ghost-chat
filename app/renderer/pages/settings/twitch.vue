<script setup lang="ts">
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
import { Twitch } from '#ipc/types/store';
import Settings from '#layouts/settings.vue';
import * as IpcHandler from '#lib/ipchandler';
import { enableSuccessIndicator } from '#lib/utils/enableSuccessIndicator';
import { save } from '#lib/utils/save';

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
    await save('options.twitch.defaultChannel', defaultChannel.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableSuccessIndicator(channelSuccess);
}

async function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map((user) => user.trim());

    await save('options.twitch.userBlacklist', blacklist);
    userBlacklist.value = blacklist;

    enableSuccessIndicator(blacklistSuccess);
}

async function saveFadeTimeout(value: number) {
    if (fade.value) {
        await save('options.twitch.fadeTimeout', value);
    }
}

function parseStrokeOrShadow(value: string) {
    switch (value) {
        case 'false':
            return false;
        default:
            return Number.parseInt(value);
    }
}
</script>

<template>
    <Settings>
        <div class="flex flex-col gap-2">
            <Label for="default-channel">
                {{ t('settings.twitch.default-channel.input-label') }}
            </Label>
            <Input
                id="default-channel"
                v-model="defaultChannel"
                :class="channelSuccess && 'border-green-600 border'"
                @change="saveDefaultChannel"
            />
            <small class="text-muted-foreground">{{ t('settings.twitch.default-channel.info') }}</small>
        </div>

        <div class="flex flex-col gap-2">
            <Label for="theme">
                {{ t('settings.twitch.chat-selector.label') }}
            </Label>
            <Switch
                v-model:checked="useJChat"
                @update:checked="(value) => save('options.twitch.useJChat', value)"
            />
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
            @update:animate="(value) => save('options.twitch.animate', value)"
            @update:fade="
                (value) => {
                    fade = value;
                    save('options.twitch.fade', value);
                }
            "
            @update:bots="(value) => save('options.twitch.bots', value)"
            @update:hide-commands="(value) => save('options.twitch.hideCommands', value)"
            @update:hide-badges="(value) => save('options.twitch.hideBadges', value)"
            @update:font="(value) => save('options.twitch.font', Number.parseInt(value) as Twitch['font'])"
            @update:stroke="(value) => save('options.twitch.stroke', parseStrokeOrShadow(value) as Twitch['stroke'])"
            @update:shadow="(value) => save('options.twitch.shadow', parseStrokeOrShadow(value) as Twitch['shadow'])"
            @update:small-caps="(value) => save('options.twitch.smallCaps', value)"
            @update:font-size="(value) => save('options.twitch.fontSize', Number.parseInt(value) as Twitch['fontSize'])"
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
            @update:theme="(value) => save('options.twitch.theme', value)"
            @update:prevent-clipping="(value) => save('options.twitch.preventClipping', value)"
            @update:fade="
                (value) => {
                    fade = value;
                    save('options.twitch.fade', value);
                }
            "
            @update:bots="(value) => save('options.twitch.bots', value)"
            @update:font-size-exact="(value) => save('options.twitch.fontSizeExact', value)"
            @update:fade-timeout="saveFadeTimeout"
        />

        <div class="flex flex-col gap-2">
            <Label for="user-blacklist">
                {{ t('settings.twitch.user-blacklist.label') }}
            </Label>
            <Input
                id="user-blacklist"
                :model-value="userBlacklist.join(', ')"
                :class="blacklistSuccess && 'border-green-600 border'"
                @change="updateBlacklist"
            />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="css-editor">
                {{ t('settings.twitch.css-editor.label') }}
            </Label>
            <Editor
                id="css-editor"
                option="twitch"
                type="css"
            />
        </div>

        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.twitch.js-editor.label') }}
            </Label>
            <Editor
                id="js-editor"
                option="twitch"
                type="js"
            />
        </div>
    </Settings>
</template>
