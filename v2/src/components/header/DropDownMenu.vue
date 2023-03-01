<script setup lang="ts">
import { ipcRenderer } from 'electron';

import { IpcConstants } from '../../../shared/constants';

const props = defineProps<{ isChatPage: boolean; isMainPage: boolean; channel: string }>();

const emit = defineEmits(['showSettings', 'showChat', 'showMain', 'vanish']);

const showSettings = () => {
	document.querySelector('details')?.removeAttribute('open');
	emit('showSettings');
};

const toggleTheme = () => {
	const $html = document.querySelector('html');
	const theme = $html?.getAttribute('data-theme');

	if (theme && theme === 'dark') {
		$html?.setAttribute('data-theme', 'light');
	} else {
		$html?.setAttribute('data-theme', 'dark');
	}
};

const setClickThrough = () => {
	document.querySelector('details')?.removeAttribute('open');
	ipcRenderer.send(IpcConstants.SetClickThrough);
};
</script>

<template>
	<details id="app-menu" role="list">
		<summary id="menu" aria-haspopup="listbox" role="button" class="secondary">
			<span><font-awesome-icon icon="fa-solid fa-bars" /></span>
		</summary>
		<ul role="listbox">
			<li v-if="!isMainPage"><a @click="emit('showMain')">Main</a></li>
			<li v-if="!props.isChatPage && props.channel !== ''">
				<a @click="emit('showChat')">Chat</a>
			</li>
			<li><a @click="showSettings">Settings</a></li>
			<li><a @click="setClickThrough">Set click-through</a></li>
			<li><a @click="toggleTheme">Toggle Color Theme</a></li>
			<li v-if="isChatPage" id="vanish">
				<a @click="emit('vanish')">
					<font-awesome-icon icon="fa-solid fa-ghost" />
					<span>Vanish</span>
				</a>
				<span data-tooltip="transparent and click-through" data-placement="bottom">?</span>
			</li>
		</ul>
	</details>
</template>
