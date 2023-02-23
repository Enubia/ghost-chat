<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import type { AppStore } from '../shared/constants';

import DropDownMenu from './components/header/DropDownMenu.vue';
import MenuButtons from './components/header/MenuButtons.vue';
import Settings from './components/settings/Settings.vue';

const store = new ElectronStore<AppStore>();

postMessage({ payload: 'removeLoading' }, '*');

const version = ref('');

ipcRenderer.on('get-version', (_, args) => {
	version.value = `v${args}`;
});

const showSettings = ref(false);

function setShowSetting() {
	showSettings.value = true;
}
</script>

<template>
	<header>
		<DropDownMenu :store="store" @show-settings="setShowSetting" />
		<MenuButtons :store="store" :is-chat-page="true" />
	</header>
	<main class="container-fluid">
		<div v-if="showSettings">
			<Settings />
		</div>
		<div v-else></div>
	</main>
	<span id="version">{{ version }}</span>
</template>
