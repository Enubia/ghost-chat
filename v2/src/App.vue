<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref } from 'vue';

import MenuButtons from './components/MenuButtons.vue';

postMessage({ payload: 'removeLoading' }, '*');

const version = ref('');

ipcRenderer.on('get-version', (_, args) => {
	version.value = `v${args}`;
});

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
	<header>
		<details id="app-info" role="list">
			<summary id="menu" aria-haspopup="listbox" role="button" class="secondary">
				<img src="./assets/svg/ghost.svg" />
			</summary>
			<ul role="listbox">
				<li><a @click="toggleTheme">Toggle Color Theme</a></li>
				<!-- <li><a>Another action</a></li>
				<li><a>Something else here</a></li> -->
			</ul>
		</details>
		<MenuButtons :is-chat-page="true" />
	</header>
	<main class="container-fluid">
		<i class="fa-solid fa-house"></i>
	</main>
	<span id="version">{{ version }}</span>
</template>
