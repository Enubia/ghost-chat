<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { AppStore, IpcConstants, StoreKeys } from '../shared/constants';

import Chat from './components/chat/Chat.vue';
import DropDownMenu from './components/header/DropDownMenu.vue';
import MenuButtons from './components/header/MenuButtons.vue';
import Main from './components/main/Main.vue';

const store = new ElectronStore<AppStore>();

postMessage({ payload: 'removeLoading' }, '*');

const version = ref('');
const showMain = ref(true);
const showChat = ref(false);

ipcRenderer.on('get-version', (_, args) => {
	version.value = `v${args}`;
});

function spawnSettings() {
	console.log('here we should spawn the settings in a new window');
}

const savedWindowState = store.get(StoreKeys.SavedWindowState);

function setShowMain() {
	showChat.value = false;
	showMain.value = true;
}
function setShowChat() {
	showChat.value = true;
	showMain.value = false;
}

function vanishWindow() {
	ipcRenderer.send(IpcConstants.Vanish);
}

function enableChat(channel: string) {
	store.set('channelOptions.channel', channel);
	setShowChat();
}
</script>

<template>
	<header v-if="!savedWindowState.isTransparent">
		<DropDownMenu
			:is-chat-page="showChat"
			:is-main-page="showMain"
			@show-settings="spawnSettings"
			@show-main="setShowMain"
			@show-chat="setShowChat"
			@vanish="vanishWindow"
		/>
		<MenuButtons :store="store" @back="setShowMain" />
	</header>
	<main class="container-fluid">
		<Main v-if="showMain" @channel="enableChat" />
		<Chat v-else-if="showChat" :store="store" />
	</main>
	<span id="version">{{ version }}</span>
</template>
