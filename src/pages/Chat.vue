<template>
	<div id="webview-tag">
		<webview :src="link" style="display: inline-flex; width: 99%; height: 95%" />
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { onMounted } from 'vue';

import type { AppStore, WebviewTag } from '../../shared/types';

const SearchParams = {
	THEME: 'theme',
	CHANNEL: 'channel',
	FADE: 'fade',
	BOT_ACTIVITY: 'bot_activity',
	PREVENT_CLIPPING: 'prevent_clipping',
};

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const channelOptions = props.store.get('channelOptions');

const link = new URL('https://nightdev.com/hosted/obschat');
link.searchParams.append(SearchParams.THEME, channelOptions.chatTheme);
link.searchParams.append(SearchParams.CHANNEL, channelOptions.channel);

if (channelOptions.fadeMessages) {
	link.searchParams.append(SearchParams.FADE, channelOptions.fadeTimeout.toString());
} else {
	link.searchParams.append(SearchParams.FADE, 'false');
}

link.searchParams.append(SearchParams.BOT_ACTIVITY, channelOptions.showBotActivity.toString());
link.searchParams.append(SearchParams.PREVENT_CLIPPING, channelOptions.preventClipping.toString());

let webView: WebviewTag;

onMounted(() => {
	if (channelOptions.customCSS !== '') {
		webView = document.querySelector('webview') as WebviewTag;
		webView.addEventListener('dom-ready', async () => {
			await webView.insertCSS(channelOptions.customCSS);
			await webView.executeJavaScript(channelOptions.customJS);
		});
	}
});
</script>
