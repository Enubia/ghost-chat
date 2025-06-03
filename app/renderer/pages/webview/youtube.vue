<script setup lang="ts">
import { onMounted } from 'vue';

import WebView from '#components/WebView.vue';
import type { WebviewTag } from '#ipc/types/webviewtag';
import * as IpcHandler from '#lib/ipchandler';

const youtube = await IpcHandler.getYoutubeOptions();
const source = new URL(youtube.videoUrl);

onMounted(() => {
    const webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (youtube.css.length) {
            await webView.insertCSS(youtube.css);
        }
        if (youtube.js.length) {
            await webView.executeJavaScript(youtube.js);
        }
    });
});
</script>

<template>
    <WebView :tag-source="source" />
</template>
