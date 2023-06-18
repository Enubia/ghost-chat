<template>
	<div id="webview-tag">
		<webview :src="externalSource" style="display: inline-flex; width: 100%; height: 100%" />
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { onMounted } from 'vue';

import { AppStore, WebviewTag } from '../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore>; externalSource: string }>();

const chatOptions = props.store.get('chatOptions');

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
