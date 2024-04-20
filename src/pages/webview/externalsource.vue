<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { inject, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';

import type { AppStore, WebviewTag } from '@shared/types';

import WebView from '@components/WebView.vue';

const router = useRouter();
const route = useRoute();
const source = route.query.source?.toString();

if (!source) {
    router.push('/');
}

const electronStore = inject('electronStore') as ElectronStore<AppStore>;
const { external } = electronStore.get('options');

let webView: WebviewTag;

onMounted(() => {
    webView = document.querySelector('webview') as WebviewTag;
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
