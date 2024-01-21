<!-- eslint-disable @stylistic/max-len -->
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
</template>
<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { IpcEvent } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

const { t } = useI18n();

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const chatOptions = props.store.get('chatOptions');

const defaultChannel = ref(chatOptions.defaultChannel);
const fadeMessages = ref(chatOptions.fadeMessages);
const fadeTimeout = ref(chatOptions.fadeTimeout);
const showBotActivity = ref(chatOptions.showBotActivity);
const preventClipping = ref(chatOptions.preventClipping);
const oldTheme = chatOptions.chatTheme;
const chatTheme = ref(chatOptions.chatTheme);
const previewLink = ref('');
const rerender = ref(0);

const SearchParams = {
    THEME: 'theme',
    CHANNEL: 'channel',
    FADE: 'fade',
    BOT_ACTIVITY: 'bot_activity',
    PREVENT_CLIPPING: 'prevent_clipping',
};

const preview = () => {
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

    props.store.set('chatOptions.chatTheme', chatTheme.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
};

const saveShowBotActivity = () => {
    props.store.set('chatOptions.showBotActivity', showBotActivity.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
};

const saveFadeMessages = () => {
    props.store.set('chatOptions.fadeMessages', fadeMessages.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
};

const saveFadeTimeout = () => {
    if (fadeMessages.value) {
        props.store.set('chatOptions.fadeTimeout', fadeTimeout.value);
        ipcRenderer.send(IpcEvent.Rerender, 'parent');
    }
};

const saveDefaultChannel = () => {
    props.store.set('chatOptions.defaultChannel', defaultChannel.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
};

const savePreventClipping = () => {
    props.store.set('chatOptions.preventClipping', preventClipping.value);
    ipcRenderer.send(IpcEvent.Rerender, 'parent');
};
</script>

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
</style>
