<script setup lang="ts">
import WebView from '#components/WebView.vue';
import type { WebviewTag } from '#ipc/types/webviewtag';
import * as IpcHandler from '#lib/ipchandler';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const source = new URL(route.query.source!.toString());

onMounted(async () => {
    const external = await IpcHandler.getExternalOptions();

    const webView = document.querySelector('webview') as WebviewTag;

    webView.addEventListener('dom-ready', async () => {
        if (external.css !== '') {
            await webView.insertCSS(external.css);
        }
        if (external.js !== '') {
            await webView.executeJavaScript(external.js);
        }
    });
});
</script>

<template>
    <WebView :tag-source="source" />
</template>
