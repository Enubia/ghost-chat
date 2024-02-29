<script setup lang="ts">
import type ElectronStore from 'electron-store';
import { onMounted } from 'vue';

import type { AppStore, WebviewTag } from '../../shared/types';
import WebView from '../components/WebView.vue';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const SearchParams = {
    THEME: 'theme',
    CHANNEL: 'channel',
    FADE: 'fade',
    BOT_ACTIVITY: 'bot_activity',
    PREVENT_CLIPPING: 'prevent_clipping',
};

const chatOptions = props.store.get('chatOptions');

const link = new URL('https://nightdev.com/hosted/obschat');
link.searchParams.append(SearchParams.THEME, chatOptions.chatTheme);
link.searchParams.append(SearchParams.CHANNEL, chatOptions.channel);

if (chatOptions.fadeMessages) {
    link.searchParams.append(SearchParams.FADE, chatOptions.fadeTimeout.toString());
} else {
    link.searchParams.append(SearchParams.FADE, 'false');
}

link.searchParams.append(SearchParams.BOT_ACTIVITY, chatOptions.showBotActivity.toString());
link.searchParams.append(SearchParams.PREVENT_CLIPPING, chatOptions.preventClipping.toString());

let webView: WebviewTag;

function constructInjectableCSS() {
    const fontSize = `.chat_line { font-size: ${chatOptions.fontSize}px !important; }`;
    return [fontSize, chatOptions.customCSS].join('\n');
}

function constructInjectableJS() {
    if (!chatOptions.userBlacklist || chatOptions.userBlacklist.length === 0) {
        return chatOptions.customJS;
    }

    const preparedBlacklist = JSON.stringify(chatOptions.userBlacklist).toLowerCase();
    const blackList = `
        const observer = new MutationObserver((changes) => {
            for (const change of changes) {
                for (const node of change.addedNodes) {
                    if (${preparedBlacklist}.includes(node.attributes['data-nick'].value)) {
                        node.remove();
                    }
                }
            }
        });

        observer.observe(document.querySelector('#chat_box'), {
            childList: true,
        });    
    `;

    return [blackList, chatOptions.customJS].join('\n');
}

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        await webView.insertCSS(constructInjectableCSS());
    });

    webView.addEventListener('dom-ready', async () => {
        await webView.executeJavaScript(constructInjectableJS());
    });
});
</script>

<template>
    <WebView :tag-source="link.toString()" />
</template>
