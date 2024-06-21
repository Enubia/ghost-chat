<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router/auto';

import type { WebviewTag } from '#shared/types';

import WebView from '#components/WebView.vue';
import IpcHandler from '#lib/ipchandler';

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
