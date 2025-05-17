<script setup lang="ts">
import type { WebviewTag } from '#ipc/types/webviewtag';

import { onMounted } from 'vue';

import WebView from '#components/WebView.vue';
import IpcHandler from '#lib/ipchandler';

const youtube = await IpcHandler.getYoutubeOptions();
const source = new URL(youtube.video_url);

function constructInjectableJS() {
    if (!youtube.userBlacklist || youtube.userBlacklist.length === 0) {
        return youtube.js;
    }

    const preparedBlacklist = JSON.stringify(youtube.userBlacklist).toLowerCase();
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

    return [blackList, youtube.js].join('\n');
}

onMounted(() => {
    const webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (youtube.css.length) {
            await webView.insertCSS(youtube.css);
        }
        if (youtube.js.length) {
            await webView.executeJavaScript(constructInjectableJS());
        }
    });
});
</script>

<template>
    <WebView :tag-source="source" />
</template>
