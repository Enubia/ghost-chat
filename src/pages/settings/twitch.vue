<script setup lang="ts">
import type ElectronStore from 'electron-store';

import Settings from '@layouts/settings.vue';
import { ipcRenderer } from 'electron';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

import Editor from '@components/settings/Editor.vue';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Slider } from '@components/ui/slider';
import { Switch } from '@components/ui/switch';
import { IpcEvent } from '@shared/constants';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const chatOptions = electronStore.get('chatOptions');

const defaultChannel = ref(chatOptions.defaultChannel);
const fadeMessages = ref(chatOptions.fadeMessages);
const fadeTimeout = ref(chatOptions.fadeTimeout);
const showBotActivity = ref(chatOptions.showBotActivity);
const preventClipping = ref(chatOptions.preventClipping);
const oldTheme = chatOptions.chatTheme;
const chatTheme = ref(chatOptions.chatTheme);
const previewLink = ref('');
const rerender = ref(0);
const fontSize = ref([Number.parseInt(chatOptions.fontSize || '14')]);
const userBlacklist = ref(chatOptions.userBlacklist || []);

const channelSuccess = ref(false);
const blacklistSuccess = ref(false);

const SearchParams = {
    THEME: 'theme',
    CHANNEL: 'channel',
    FADE: 'fade',
    BOT_ACTIVITY: 'bot_activity',
    PREVENT_CLIPPING: 'prevent_clipping',
};

function preview() {
    let previewChannel = 'zackrawrr';

    if (chatOptions.channel !== '') {
        previewChannel = chatOptions.channel;
    } else if (defaultChannel.value !== '') {
        previewChannel = defaultChannel.value;
    }

    const link = new URL('https://nightdev.com/hosted/obschat');
    link.searchParams.append(SearchParams.THEME, chatTheme.value);
    link.searchParams.append(SearchParams.CHANNEL, previewChannel);

    if (fadeTimeout.value) {
        link.searchParams.append(SearchParams.FADE, fadeTimeout.value.toString());
    } else {
        link.searchParams.append(SearchParams.FADE, 'false');
    }

    link.searchParams.append(SearchParams.BOT_ACTIVITY, showBotActivity.value.toString());
    link.searchParams.append(SearchParams.PREVENT_CLIPPING, preventClipping.value.toString());

    previewLink.value = link.toString();
    rerender.value += 1;

    electronStore.set('chatOptions.chatTheme', chatTheme.value);
}

function saveShowBotActivity() {
    electronStore.set('chatOptions.showBotActivity', showBotActivity.value);
}

function saveFadeMessages() {
    electronStore.set('chatOptions.fadeMessages', fadeMessages.value);
}

function saveFadeTimeout() {
    if (fadeMessages.value) {
        electronStore.set('chatOptions.fadeTimeout', fadeTimeout.value);
    }
}

function saveDefaultChannel() {
    electronStore.set('chatOptions.defaultChannel', defaultChannel.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
    enableChannelSuccess();
}

function savePreventClipping() {
    electronStore.set('chatOptions.preventClipping', preventClipping.value);
}

function saveFontSize() {
    setTimeout(() => {
        electronStore.set('chatOptions.fontSize', fontSize.value[0]);
    }, 200);
}

function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());
    electronStore.set('chatOptions.userBlacklist', blacklist);
    userBlacklist.value = blacklist;
    enableBlacklistSuccess();
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
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Switch id="fade" v-model:checked="fadeMessages" @update:checked="saveFadeMessages" />
                    <Label class="cursor-pointer" for="fade">
                        {{ t('settings.twitch.fade.checkbox-label') }}
                    </Label>
                </div>
                <div v-if="fadeMessages">
                    <Label class="cursor-pointer" for="fade">
                        {{ t('settings.twitch.fade.timeout-label', { seconds: fadeTimeout }) }}
                    </Label>
                    <Input v-model="fadeTimeout" class="w-30 text-center" type="number" @change="saveFadeTimeout" />
                </div>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.fade.info') }}</small>
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="show-bots" v-model:checked="showBotActivity" @update:checked="saveShowBotActivity" />
                <Label class="align-elements" for="show-bots">
                    {{ t('settings.twitch.show-bots.checkbox-label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.show-bots.info') }}</small>
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Switch id="prevent-clipping" v-model:checked="preventClipping" @update:checked="savePreventClipping" />
                <Label class="align-elements" for="prevent-clipping">
                    {{ t('settings.twitch.prevent-clipping.checkbox-label') }}
                </Label>
            </div>
            <small class="text-muted-foreground">{{ t('settings.twitch.prevent-clipping.info') }}</small>
        </div>
        <div class="flex flex-col gap-2">
            <Label for="chat-theme">
                {{ t('settings.twitch.chat-theme.label') }}
            </Label>
            <Select id="chat-theme" v-model="chatTheme" @update:model-value="preview">
                <SelectTrigger>
                    <SelectValue :placeholder="t('settings.twitch.chat-theme.label')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="undefined" selected>
                        {{ t('settings.twitch.chat-theme.select-options.none') }}
                    </SelectItem>
                    <SelectItem value="dark">
                        {{ t('settings.twitch.chat-theme.select-options.dark') }}
                    </SelectItem>
                    <SelectItem value="light">
                        {{ t('settings.twitch.chat-theme.select-options.light') }}
                    </SelectItem>
                    <SelectItem value="bttv_light">
                        {{ t('settings.twitch.chat-theme.select-options.betterTTV-Light') }}
                    </SelectItem>
                    <SelectItem value="bttv_dark">
                        {{ t('settings.twitch.chat-theme.select-options.betterTTV-Dark') }}
                    </SelectItem>
                    <SelectItem value="s0n0s_1080">
                        {{ t('settings.twitch.chat-theme.select-options.s0N0S-1080P-Theme') }}
                    </SelectItem>
                    <SelectItem value="s0n0s_1440">
                        {{ t('settings.twitch.chat-theme.select-options.s0N0S-1440P-Theme') }}
                    </SelectItem>
                </SelectContent>
            </Select>
            <div v-if="chatTheme !== oldTheme" class="flex flex-col">
                <iframe :key="rerender" :src="previewLink" />
                <small class="text-primary underline">
                    {{ t('settings.twitch.chat-theme.notification') }}
                </small>
            </div>
            <small v-if="chatTheme === 'undefined'" class="text-muted-foreground">
                {{ t('settings.twitch.chat-theme.info.before-link') }}
                <a
                    href="https://nightdev.com/hosted/obschat?theme=undefined&channel=esamarathon&fade=false&bot_activity=false&prevent_clipping=false"
                    class="text-primary underline"
                >
                    {{ t('settings.twitch.chat-theme.info.link') }}
                </a>
                {{ t('settings.twitch.chat-theme.info.after-link') }}
            </small>
        </div>
        <div class="flex flex-col gap-2">
            <Label for="range">
                {{ t('settings.twitch.font-size.label') }}
            </Label>
            <Slider
                id="range" v-model="fontSize" :min="10" :max="50" :step="1" :default-value="[50]"
                @update:model-value="saveFontSize"
            />
            <span class="text-muted-foreground" :style="`font-size: ${fontSize}px`">
                {{ t('settings.twitch.font-size.small', { fontSize: fontSize[0] }) }}
            </span>
        </div>
        <div class="flex flex-col gap-2">
            <Label for="user-blacklist">
                {{ t('settings.twitch.user-blacklist.label') }}
            </Label>
            <Input
                id="user-blacklist" :default-value="userBlacklist.join(', ')"
                :class="blacklistSuccess && 'border-green-600 border'" @change="updateBlacklist"
            />
            <small class="text-muted-foreground">{{ t('settings.twitch.user-blacklist.info') }}</small>
        </div>
        <div class="flex flex-col gap-2">
            <Label for="css-editor">
                {{ t('settings.twitch.css-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.twitch.css-editor.info') }}</small>
            <Editor id="css-editor" type="css" />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="js-editor">
                {{ t('settings.twitch.js-editor.label') }}
            </Label>
            <small class="text-yellow-600">{{ t('settings.twitch.js-editor.info') }}</small>
            <Editor id="js-editor" type="js" />
        </div>
    </Settings>
</template>
