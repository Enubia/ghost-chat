<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { inject, onMounted } from 'vue';

import WebView from '@components/WebView.vue';
import { type AppStore, KickSearchParams, type WebviewTag } from '@shared/types';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { kick } = electronStore.get('options');

const link = new URL('https://kick-chat.corard.tv/v1/chat');

let channel = '';

if (kick.channel !== '') {
    channel = kick.channel;
} else if (kick.defaultChannel !== '') {
    channel = kick.defaultChannel;
}

link.searchParams.append(KickSearchParams.USER, channel);
link.searchParams.append(KickSearchParams.FONT_SIZE, kick.fontSize);
link.searchParams.append(KickSearchParams.STROKE, kick.stroke);
link.searchParams.append(KickSearchParams.ANIMATE, kick.animate.toString());

if (kick.fade) {
    link.searchParams.append(KickSearchParams.FADE, kick.fadeTimeout.toString());
}

link.searchParams.append(KickSearchParams.BADGES, kick.badges.toString());
link.searchParams.append(KickSearchParams.COMMANDS, kick.commands.toString());
link.searchParams.append(KickSearchParams.BOTS, kick.bots.toString());

let webView: WebviewTag;

function constructInjectableJS() {
    if (!kick.userBlacklist || kick.userBlacklist.length === 0) {
        return kick.js;
    }

    const preparedBlacklist = JSON.stringify(kick.userBlacklist).toLowerCase();
    const blackList = `
        const observer = new MutationObserver((changes) => {
            for (const change of changes) {
                for (const node of change.addedNodes) {
                    if (${preparedBlacklist}.includes(node.attributes['data-sender'].value)) {
                        node.remove();
                    }
                }
            }
        });

        observer.observe(document.querySelector('#chat-container'), {
            childList: true,
        });
    `.trim();

    return [blackList, kick.js].join('\n');
}

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;

    if (kick.css.length) {
        webView.addEventListener('dom-ready', async () => {
            await webView.insertCSS(kick.css);
        });
    }

    if (kick.js.length) {
        webView.addEventListener('dom-ready', async () => {
            await webView.executeJavaScript(constructInjectableJS());
        });
    }
});
</script>

<template>
    <WebView :tag-source="link.toString()" class="overflow-hidden" />
</template>
