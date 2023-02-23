<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { AppStore, StoreKeys } from '../../../shared/constants';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const channel = props.store.get(StoreKeys.Channel);

const emit = defineEmits<{
	(event: 'showSettings'): void;
	(event: 'showChat'): void;
	(event: 'showMain'): void;
}>();

const toggleTheme = () => {
	const $html = document.querySelector('html');
	const theme = $html?.getAttribute('data-theme');

	if (theme && theme === 'dark') {
		$html?.setAttribute('data-theme', 'light');
	} else {
		$html?.setAttribute('data-theme', 'dark');
	}
};
</script>

<template>
	<details id="app-info" role="list">
		<summary id="menu" aria-haspopup="listbox" role="button" class="secondary">
			<img src="../../assets/svg/ghost.svg" />
		</summary>
		<ul role="listbox">
			<li><a @click="emit('showMain')">Main</a></li>
			<li v-if="channel !== ''"><a @click="emit('showChat')">Chat</a></li>
			<li><a @click="emit('showSettings')">Settings</a></li>
			<li><a @click="toggleTheme">Toggle Color Theme</a></li>
		</ul>
	</details>
</template>
