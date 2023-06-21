<template>
	<WebView :tag-source="link.toString()" />
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { onMounted } from 'vue';

import type { AppStore, WebviewTag } from '../../shared/types';
import WebView from '../components/WebView.vue';

const SearchParams = {
	THEME: 'theme',
	CHANNEL: 'channel',
	FADE: 'fade',
	BOT_ACTIVITY: 'bot_activity',
	PREVENT_CLIPPING: 'prevent_clipping',
};

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const chatOptions = props.store.get('chatOptions');

const link = new URL('https://nightdev.com/hosted/obschat');
link.searchParams.append(SearchParams.THEME, chatOptions.chatTheme);
link.searchParams.append(SearchParams.CHANNEL, chatOptions.channel);

if (chatOptions.fadeMessages) {
	link.searchParams.append(SearchParams.FADE, chatOptions.fadeTimeout.toString());
} else {
	link.searchParams.append(SearchParams.FADE, 'false');
}

link.searchParams.append(SearchParams.BOT_ACTIVITY, chatOptions.showBotActivity.toString());
link.searchParams.append(SearchParams.PREVENT_CLIPPING, chatOptions.preventClipping.toString());

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
