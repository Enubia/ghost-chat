<script setup lang="ts">
import type ElectronStore from 'electron-store';
import { inject, onMounted } from 'vue';

import type { AppStore, WebviewTag } from '@shared/types';
import WebView from '@components/WebView.vue';
import { useRoute, useRouter } from 'vue-router/auto';

const router = useRouter();
const route = useRoute();
const source = route.query.source?.toString();

if (!source) {
    router.push('/');
}

const electronStore = inject('electronStore') as ElectronStore<AppStore>;
const chatOptions = electronStore.get('chatOptions');

let webView: WebviewTag;

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;
    if (chatOptions.customCSS !== '') {
        webView.addEventListener('dom-ready', async () => {
            await webView.insertCSS(chatOptions.customCSS);
        });
    }

    if (chatOptions.customJS !== '') {
        webView.addEventListener('dom-ready', async () => {
            await webView.executeJavaScript(chatOptions.customJS);
        });
    }
});
</script>

<template>
    <WebView :tag-source="source as string" />
</template>
