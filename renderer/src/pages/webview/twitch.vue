<script setup lang="ts">
import type { WebviewTag } from '#shared/types/webviewtag';

import { onMounted, shallowRef } from 'vue';

import WebView from '#components/WebView.vue';
import IpcHandler from '#lib/ipchandler';
import { TwitchSearchParams } from '#shared/constants/searchparams';

const twitch = shallowRef(await IpcHandler.getTwitchOptions());
const link = shallowRef(
    twitch.value.useJChat
        ? new URL('https://www.giambaj.it/twitch/jchat/v2/')
        : new URL('https://nightdev.com/hosted/obschat/'),
);

let channel = '';

if (twitch.value.channel !== '') {
    channel = twitch.value.channel;
} else if (twitch.value.defaultChannel !== '') {
    channel = twitch.value.defaultChannel;
}

link.value.searchParams.append(TwitchSearchParams.CHANNEL, channel);

if (twitch.value.useJChat) {
    if (twitch.value.fade) {
        link.value.searchParams.append(TwitchSearchParams.FADE, twitch.value.fadeTimeout.toString());
    }

    link.value.searchParams.append(TwitchSearchParams.SIZE, twitch.value.fontSize.toString());

    if (twitch.value.animate) {
        link.value.searchParams.append(TwitchSearchParams.ANIMATE, 'true');
    }

    if (twitch.value.bots) {
        link.value.searchParams.append(TwitchSearchParams.BOTS, 'true');
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
} else {
    link.value.searchParams.append(TwitchSearchParams.THEME, twitch.value.theme.toString());
    link.value.searchParams.append(TwitchSearchParams.PREVENT_CLIPPING, twitch.value.preventClipping.toString());
    link.value.searchParams.append(TwitchSearchParams.FADE, twitch.value.fade ? twitch.value.fadeTimeout.toString() : 'false');
    link.value.searchParams.append(TwitchSearchParams.BOT_ACTIVITY, twitch.value.bots.toString());
}

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

function constructInjectableCSS() {
    // need to apply the font size to the chat box and chat lines
    // sometimes it doesn't apply when a theme is selected
    const css = `
        #chat_box {
            font-size: ${twitch.value.fontSizeExact}px !important;
        }

        #chat_box .chat_line {
            font-size: ${twitch.value.fontSizeExact}px !important;
        }
    `;
    return [css, twitch.value.css].join('\n');
}

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (twitch.value.useJChat) {
            await webView.insertCSS(twitch.value.css);
        } else {
            await webView.insertCSS(constructInjectableCSS());
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
