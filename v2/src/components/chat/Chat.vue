<script setup lang="ts">
import { onMounted } from 'vue';

import { ChannelOptions } from '../../../shared/constants';

import SearchParams from './linkSearchParams';
const props = defineProps<{ channelOptions: ChannelOptions }>();

const link = new URL('https://nightdev.com/hosted/obschat');
link.searchParams.append(SearchParams.THEME, 'undefined');
link.searchParams.append(SearchParams.CHANNEL, props.channelOptions.channel);

if (props.channelOptions.fadeMessages) {
	link.searchParams.append(SearchParams.FADE, props.channelOptions.fadeMessages.toString());
} else {
	link.searchParams.append(SearchParams.FADE, 'false');
}

link.searchParams.append(SearchParams.BOT_ACTIVITY, props.channelOptions.showBotActivity.toString());
link.searchParams.append(SearchParams.PREVENT_CLIPPING, 'false');

let webView: Element;
onMounted(() => {
	if (props.channelOptions.customCSS !== '') {
		webView = document.querySelector('webview') as Element;
		webView.addEventListener('dom-ready', async () => {
			// WebviewTag type is not exposed from electron
			// @ts-ignore
			await webView.insertCSS(props.channelOptions.customCSS);
		});
	}
});
</script>
<template>
	<div id="webview-tag">
		<webview :src="link" style="display: inline-flex; width: 99%; height: 95%" />
	</div>
</template>
