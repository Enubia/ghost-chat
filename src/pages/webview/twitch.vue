<script setup lang="ts">
import type { Ref } from 'vue';

import IpcHandler from '@lib/ipchandler';
import { onBeforeMount, onMounted, ref } from 'vue';

import type { Twitch, WebviewTag } from '@shared/types';

import WebView from '@components/WebView.vue';
import { StoreDefaults, TwitchSearchParams } from '@shared/constants';

const twitch = ref<Twitch>(StoreDefaults.options.twitch);
const link = ref() as Ref<URL>;

onBeforeMount(async () => {
    twitch.value = await IpcHandler.getTwitchOptions();
    link.value = new URL('https://www.giambaj.it/twitch/jchat/v2/');

    let channel = '';

    if (twitch.value.channel !== '') {
        channel = twitch.value.channel;
    } else if (twitch.value.defaultChannel !== '') {
        channel = twitch.value.defaultChannel;
    }

    link.value.searchParams.append(TwitchSearchParams.CHANNEL, channel);

    link.value.searchParams.append(TwitchSearchParams.SIZE, twitch.value.fontSize.toString());

    if (twitch.value.animate) {
        link.value.searchParams.append(TwitchSearchParams.ANIMATE, 'true');
    }

    if (twitch.value.bots) {
        link.value.searchParams.append(TwitchSearchParams.BOTS, 'true');
    }

    if (twitch.value.fade) {
        link.value.searchParams.append(TwitchSearchParams.FADE, twitch.value.fadeTimeout.toString());
    }

    if (twitch.value.hideCommands) {
        link.value.searchParams.append(TwitchSearchParams.HIDE_COMMANDS, 'true');
    }

    if (twitch.value.hideBadges) {
        link.value.searchParams.append(TwitchSearchParams.HIDE_BADGES, 'true');
    }

    link.value.searchParams.append(TwitchSearchParams.FONT, twitch.value.font.toString());

    if (twitch.value.stroke) {
        link.value.searchParams.append(TwitchSearchParams.STROKE, twitch.value.stroke.toString());
    }

    if (twitch.value.shadow) {
        link.value.searchParams.append(TwitchSearchParams.SHADOW, twitch.value.shadow.toString());
    }

    if (twitch.value.smallCaps) {
        link.value.searchParams.append(TwitchSearchParams.SMALL_CAPS, 'true');
    }
});

let webView: WebviewTag;

function constructInjectableJS() {
    if (!twitch.value.userBlacklist || twitch.value.userBlacklist.length === 0) {
        return twitch.value.js;
    }

    const preparedBlacklist = JSON.stringify(twitch.value.userBlacklist).toLowerCase();
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

    return [blackList, twitch.value.js].join('\n');
}

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (twitch.value.css.length) {
            await webView.insertCSS(twitch.value.css);
        }

        if (twitch.value.js.length) {
            await webView.executeJavaScript(constructInjectableJS());
        }
    });
});
</script>

<template>
    <WebView :tag-source="link" class="overflow-hidden" />
</template>
