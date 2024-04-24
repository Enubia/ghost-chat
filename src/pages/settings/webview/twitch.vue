<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { inject, onMounted } from 'vue';

import WebView from '@components/WebView.vue';
import { type AppStore, TwitchSearchParams, type WebviewTag } from '@shared/types';

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { twitch } = electronStore.get('options');

const link = new URL('https://www.giambaj.it/twitch/jchat/v2/');

let channel = '';

if (twitch.channel !== '') {
    channel = twitch.channel;
} else if (twitch.defaultChannel !== '') {
    channel = twitch.defaultChannel;
}

link.searchParams.append(TwitchSearchParams.CHANNEL, channel);

link.searchParams.append(TwitchSearchParams.SIZE, twitch.fontSize.toString());

if (twitch.animate) {
    link.searchParams.append(TwitchSearchParams.ANIMATE, 'true');
}

if (twitch.bots) {
    link.searchParams.append(TwitchSearchParams.BOTS, 'true');
}

if (twitch.fade) {
    link.searchParams.append(TwitchSearchParams.FADE, twitch.fadeTimeout.toString());
}

if (twitch.hideCommands) {
    link.searchParams.append(TwitchSearchParams.HIDE_COMMANDS, 'true');
}

if (twitch.hideBadges) {
    link.searchParams.append(TwitchSearchParams.HIDE_BADGES, 'true');
}

link.searchParams.append(TwitchSearchParams.FONT, twitch.font.toString());

if (twitch.stroke) {
    link.searchParams.append(TwitchSearchParams.STROKE, twitch.stroke.toString());
}

if (twitch.shadow) {
    link.searchParams.append(TwitchSearchParams.SHADOW, twitch.shadow.toString());
}

if (twitch.smallCaps) {
    link.searchParams.append(TwitchSearchParams.SMALL_CAPS, 'true');
}

let webView: WebviewTag;

function constructInjectableJS() {
    if (!twitch.userBlacklist || twitch.userBlacklist.length === 0) {
        return twitch.js;
    }

    const preparedBlacklist = JSON.stringify(twitch.userBlacklist).toLowerCase();
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

        observer.observe(document.querySelector('#chat_container'), {
            childList: true,
        });
    `;

    return [blackList, twitch.js].join('\n');
}

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (twitch.css.length) {
            await webView.insertCSS(twitch.css);
        }

        if (twitch.js.length) {
            await webView.executeJavaScript(constructInjectableJS());
        }
    });
});
</script>

<template>
    <WebView :tag-source="link.toString()" class="overflow-hidden" />
</template>
