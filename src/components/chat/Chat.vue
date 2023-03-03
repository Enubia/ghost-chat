<script setup lang="ts">
import ElectronStore from 'electron-store';
import { onMounted } from 'vue';

import type { AppStore } from '../../../shared/types';

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
link.searchParams.append(SearchParams.THEME, 'undefined');
link.searchParams.append(SearchParams.CHANNEL, channelOptions.channel);

if (channelOptions.fadeMessages) {
	link.searchParams.append(SearchParams.FADE, channelOptions.fadeMessages.toString());
} else {
	link.searchParams.append(SearchParams.FADE, 'false');
}

link.searchParams.append(SearchParams.BOT_ACTIVITY, channelOptions.showBotActivity.toString());
link.searchParams.append(SearchParams.PREVENT_CLIPPING, 'false');

let webView: Element;
onMounted(() => {
	if (channelOptions.customCSS !== '') {
		webView = document.querySelector('webview') as Element;
		webView.addEventListener('dom-ready', async () => {
			// WebviewTag type is not exposed from electron
			// @ts-ignore
			await webView.insertCSS(channelOptions.customCSS);
		});
	}
});
</script>
<template>
	<div id="webview-tag">
		<webview :src="link" style="display: inline-flex; width: 99%; height: 95%" />
	</div>
</template>
