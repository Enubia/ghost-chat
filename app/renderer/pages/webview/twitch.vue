<script setup lang="ts">
import type { WebviewTag } from '#ipc/types/webviewtag';

import { onMounted } from 'vue';

import WebView from '#components/WebView.vue';
import IpcHandler from '#lib/ipchandler';

import { TwitchSearchParams } from '../../constants/searchparams';

const twitch = await IpcHandler.getTwitchOptions();
const link
    = twitch.useJChat
        ? new URL('https://www.giambaj.it/twitch/jchat/v2/')
        : new URL('https://nightdev.com/hosted/obschat/');

let channel = '';

if (twitch.channel !== '') {
    channel = twitch.channel;
} else if (twitch.defaultChannel !== '') {
    channel = twitch.defaultChannel;
}

link.searchParams.append(TwitchSearchParams.CHANNEL, channel);

if (twitch.useJChat) {
    if (twitch.fade) {
        link.searchParams.append(TwitchSearchParams.FADE, twitch.fadeTimeout.toString());
    }

    link.searchParams.append(TwitchSearchParams.SIZE, twitch.fontSize.toString());

    if (twitch.animate) {
        link.searchParams.append(TwitchSearchParams.ANIMATE, 'true');
    }

    if (twitch.bots) {
        link.searchParams.append(TwitchSearchParams.BOTS, 'true');
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
} else {
    link.searchParams.append(TwitchSearchParams.THEME, twitch.theme.toString());
    link.searchParams.append(TwitchSearchParams.PREVENT_CLIPPING, twitch.preventClipping.toString());
    link.searchParams.append(TwitchSearchParams.FADE, twitch.fade ? twitch.fadeTimeout.toString() : 'false');
    link.searchParams.append(TwitchSearchParams.BOT_ACTIVITY, twitch.bots.toString());
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

function constructInjectableCSS() {
    // need to apply the font size to the chat box and chat lines
    // sometimes it doesn't apply when a theme is selected
    const css = `
        #chat_box {
            font-size: ${twitch.fontSizeExact}px !important;
        }

        #chat_box .chat_line {
            font-size: ${twitch.fontSizeExact}px !important;
        }
    `;
    return [css, twitch.css].join('\n');
}

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (twitch.useJChat) {
            await webView.insertCSS(twitch.css);
        } else {
            await webView.insertCSS(constructInjectableCSS());
        }

        if (twitch.js.length) {
            await webView.executeJavaScript(constructInjectableJS());
        }
    });
});
</script>

<template>
    <WebView :tag-source="link" class="overflow-hidden" />
</template>
