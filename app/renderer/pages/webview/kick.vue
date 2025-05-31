<script setup lang="ts">
import WebView from '#components/WebView.vue';
import { KickSearchParams } from '#constants/searchparams';
import type { WebviewTag } from '#ipc/types/webviewtag';
import IpcHandler from '#lib/ipchandler';
import { onMounted, shallowRef } from 'vue';

const kick = await IpcHandler.getKickOptions();
const link = shallowRef(new URL('https://kick-chat.corard.tv/v1/chat'));

let channel = '';

if (kick.channel !== '') {
    channel = kick.channel;
} else if (kick.defaultChannel !== '') {
    channel = kick.defaultChannel;
}

link.value.searchParams.append(KickSearchParams.USER, channel);
link.value.searchParams.append(KickSearchParams.FONT_SIZE, kick.fontSize);
link.value.searchParams.append(KickSearchParams.STROKE, kick.stroke);
link.value.searchParams.append(KickSearchParams.ANIMATE, kick.animate.toString());

if (kick.fade) {
    link.value.searchParams.append(KickSearchParams.FADE, kick.fadeTimeout.toString());
}

link.value.searchParams.append(KickSearchParams.BADGES, kick.badges.toString());
link.value.searchParams.append(KickSearchParams.COMMANDS, kick.commands.toString());
link.value.searchParams.append(KickSearchParams.BOTS, kick.bots.toString());

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

    webView.addEventListener('dom-ready', async () => {
        if (kick.css.length) {
            await webView.insertCSS(kick.css);
        }
        if (kick.js.length) {
            await webView.executeJavaScript(constructInjectableJS());
        }
    });
});
</script>

<template>
    <WebView
        :tag-source="link"
        class="overflow-hidden"
    />
</template>
