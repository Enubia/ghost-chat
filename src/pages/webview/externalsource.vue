<script setup lang="ts">
import IpcHandler from '@lib/ipchandler';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router/auto';

import type { WebviewTag } from '@shared/types';

import WebView from '@components/WebView.vue';

const route = useRoute();
const source = route.query.source?.toString();

onMounted(async () => {
    const { external } = await IpcHandler.getOptions();

    const webView = document.querySelector('webview') as WebviewTag;

    if (external.css !== '') {
        webView.addEventListener('dom-ready', async () => {
            await webView.insertCSS(external.css);
        });
    }

    if (external.js !== '') {
        webView.addEventListener('dom-ready', async () => {
            await webView.executeJavaScript(external.js);
        });
    }
});
</script>

<template>
    <WebView :tag-source="source as string" />
</template>
