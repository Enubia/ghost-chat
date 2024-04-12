<script setup lang="ts">
import { ipcRenderer } from 'electron';
import type ElectronStore from 'electron-store';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

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
const fontSize = ref(chatOptions.fontSize || '14');
const userBlacklist = ref(chatOptions.userBlacklist || []);
const fontSizeChanged = ref(false);
const blacklistChanged = ref(false);

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
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
}

function saveShowBotActivity() {
    electronStore.set('chatOptions.showBotActivity', showBotActivity.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
}

function saveFadeMessages() {
    electronStore.set('chatOptions.fadeMessages', fadeMessages.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
}

function saveFadeTimeout() {
    if (fadeMessages.value) {
        electronStore.set('chatOptions.fadeTimeout', fadeTimeout.value);
        ipcRenderer.send(IpcEvent.Rerender, 'parent');
    }
}

function saveDefaultChannel() {
    electronStore.set('chatOptions.defaultChannel', defaultChannel.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
}

function savePreventClipping() {
    electronStore.set('chatOptions.preventClipping', preventClipping.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
}

function saveFontSize() {
    setTimeout(() => {
        electronStore.set('chatOptions.fontSize', fontSize.value);
        fontSizeChanged.value = true;
        ipcRenderer.send(IpcEvent.Rerender, 'parent');
    }, 200);
}

function updateBlacklist(event: Event) {
    const target = event.target as HTMLInputElement;
    const blacklist = target.value.split(',').map(user => user.trim());
    electronStore.set('chatOptions.userBlacklist', blacklist);
    userBlacklist.value = blacklist;
    blacklistChanged.value = true;
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
}
</script>

<template>
    <div id="default-channel">
        <label for="default-channel-input">
            <span>{{ t('settings.document.kap-chat.default-channel.input-label') }}</span>
            <input
                id="default-channel-input"
                v-model="defaultChannel"
                type="text"
                @change="saveDefaultChannel"
            >
        </label>
        <small>{{ t('settings.document.kap-chat.default-channel.info') }}</small>
    </div>
    <hr>
    <div id="fade">
        <div class="control">
            <label
                class="align-elements"
                for="fade-input"
            >
                <input
                    id="fade-input"
                    v-model="fadeMessages"
                    type="checkbox"
                    role="switch"
                    @change="saveFadeMessages"
                >
                <span>{{ t('settings.document.kap-chat.fade.checkbox-label') }}</span>
            </label>
            <input
                v-if="fadeMessages"
                id="fade-timeout"
                v-model="fadeTimeout"
                type="number"
                @change="saveFadeTimeout"
            >
        </div>
        <small>
            {{ t('settings.document.kap-chat.fade.info') }}
        </small>
    </div>
    <hr>
    <div id="show-bots">
        <label
            class="align-elements"
            for="show-bots-input"
        >
            <input
                id="show-bots-input"
                v-model="showBotActivity"
                type="checkbox"
                role="switch"
                @change="saveShowBotActivity"
            >
            <span>{{ t('settings.document.kap-chat.show-bots.checkbox-label') }}</span>
        </label>
        <small>{{ t('settings.document.kap-chat.show-bots.info') }}</small>
    </div>
    <hr>
    <div id="prevent-clipping">
        <label
            class="align-elements"
            for="prevent-clipping-input"
        >
            <input
                id="prevent-clipping-input"
                v-model="preventClipping"
                type="checkbox"
                role="switch"
                @change="savePreventClipping"
            >
            <span>{{ t('settings.document.kap-chat.prevent-clipping.checkbox-label') }}</span>
        </label>
        <small>
            {{ t('settings.document.kap-chat.prevent-clipping.info') }}
        </small>
    </div>
    <hr>
    <div id="chat-theme">
        <label for="theme-select">
            {{ t('settings.document.kap-chat.chat-theme.label') }}
            <select
                id="theme-select"
                v-model="chatTheme"
                @change="preview"
            >
                <option
                    value="undefined"
                    selected
                >
                    {{ t('settings.document.kap-chat.chat-theme.select-options.none') }}
                </option>
                <option value="dark">
                    {{ t('settings.document.kap-chat.chat-theme.select-options.dark') }}
                </option>
                <option value="light">
                    {{ t('settings.document.kap-chat.chat-theme.select-options.light') }}
                </option>
                <option value="bttv_light">
                    {{ t('settings.document.kap-chat.chat-theme.select-options.betterTTV-Light') }}
                </option>
                <option value="bttv_dark">
                    {{ t('settings.document.kap-chat.chat-theme.select-options.betterTTV-Dark') }}
                </option>
                <option value="s0n0s_1080">
                    {{ t('settings.document.kap-chat.chat-theme.select-options.s0N0S-1080P-Theme') }}
                </option>
                <option value="s0n0s_1440">
                    {{ t('settings.document.kap-chat.chat-theme.select-options.s0N0S-1440P-Theme') }}
                </option>
            </select>
        </label>
        <div v-if="chatTheme !== oldTheme">
            <iframe
                id="preview"
                :key="rerender"
                :src="previewLink"
            />
            <br>
            <small class="info">
                {{ t('settings.document.kap-chat.chat-theme.notification') }}
            </small>
        </div>
        <small>
            {{ t('settings.document.kap-chat.chat-theme.info.before-link') }}
            <a
                href="https://nightdev.com/hosted/obschat?theme=undefined&channel=esamarathon&fade=false&bot_activity=false&prevent_clipping=false"
            >
                {{ t('settings.document.kap-chat.chat-theme.info.link') }}
            </a>
            {{ t('settings.document.kap-chat.chat-theme.info.after-link') }}
        </small>
    </div>
    <hr>
    <div id="font-size">
        <label for="range">
            <span :style="fontSizeChanged ? 'color: green;' : ''">{{ t('settings.document.kap-chat.font-size.label') }}</span>
            <font-awesome-icon
                v-if="fontSizeChanged"
                id="slider-check"
                :icon="['far', 'circle-check']"
            />
            <input
                id="range"
                v-model="fontSize"
                type="range"
                min="10"
                max="50"
                value="50"
                name="range"
                @mousedown="fontSizeChanged = false"
                @change="saveFontSize"
            >
        </label>
        <span class="center-elements" :style="`font-size: ${fontSize}px`">
            {{ t('settings.document.kap-chat.font-size.small', { fontSize }) }}
        </span>
    </div>
    <hr>
    <div id="user-blacklist">
        <label for="user-blacklist-input">
            <span>{{ t('settings.document.kap-chat.user-blacklist.label') }}</span>
            <input
                id="user-blacklist-input"
                type="text"
                :value="userBlacklist.join(', ')"
                :aria-invalid="blacklistChanged ? false : undefined"
                @change="updateBlacklist"
                @input="blacklistChanged = false"
            >
        </label>
        <small>{{ t('settings.document.kap-chat.user-blacklist.info') }}</small>
    </div>
</template>

<style lang="scss">
#preview {
    height: 300px;
    width: 100%;
    overflow: hidden;
}

.info {
    text-decoration: underline;
    text-transform: uppercase;
}

#slider-check {
    color: green;
    margin-left: 8px;
}
</style>
