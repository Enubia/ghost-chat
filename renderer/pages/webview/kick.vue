<script setup lang="ts">
import type { WebviewTag } from '#ipc/types/webviewtag';

import { onMounted, shallowRef } from 'vue';

import WebView from '#components/WebView.vue';
import IpcHandler from '#lib/ipchandler';

import { KickSearchParams } from '../../constants/searchparams';

const kick = shallowRef(await IpcHandler.getKickOptions());
const link = shallowRef(new URL('https://kick-chat.corard.tv/v1/chat'));

let channel = '';

if (kick.value.channel !== '') {
    channel = kick.value.channel;
} else if (kick.value.defaultChannel !== '') {
    channel = kick.value.defaultChannel;
}

link.value.searchParams.append(KickSearchParams.USER, channel);
link.value.searchParams.append(KickSearchParams.FONT_SIZE, kick.value.fontSize);
link.value.searchParams.append(KickSearchParams.STROKE, kick.value.stroke);
link.value.searchParams.append(KickSearchParams.ANIMATE, kick.value.animate.toString());

if (kick.value.fade) {
    link.value.searchParams.append(KickSearchParams.FADE, kick.value.fadeTimeout.toString());
}

link.value.searchParams.append(KickSearchParams.BADGES, kick.value.badges.toString());
link.value.searchParams.append(KickSearchParams.COMMANDS, kick.value.commands.toString());
link.value.searchParams.append(KickSearchParams.BOTS, kick.value.bots.toString());

let webView: WebviewTag;

function constructInjectableJS() {
    if (!kick.value.userBlacklist || kick.value.userBlacklist.length === 0) {
        return kick.value.js;
    }

    const preparedBlacklist = JSON.stringify(kick.value.userBlacklist).toLowerCase();
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

    return [blackList, kick.value.js].join('\n');
}

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (kick.value.css.length) {
            await webView.insertCSS(kick.value.css);
        }
        if (kick.value.js.length) {
            await webView.executeJavaScript(constructInjectableJS());
        }
    });
});
</script>

<template>
    <WebView :tag-source="link" class="overflow-hidden" />
</template>
