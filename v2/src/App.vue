<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { AppStore, StoreKeys } from '../shared/constants';

import Chat from './components/chat/Chat.vue';
import DropDownMenu from './components/header/DropDownMenu.vue';
import MenuButtons from './components/header/MenuButtons.vue';
import Main from './components/main/Main.vue';
import Settings from './components/settings/Settings.vue';

const store = new ElectronStore<AppStore>();

postMessage({ payload: 'removeLoading' }, '*');

const version = ref('');
const showSettings = ref(false);
const showMain = ref(true);
const showChat = ref(false);

ipcRenderer.on('get-version', (_, args) => {
	version.value = `v${args}`;
});

function setShowSetting() {
	showChat.value = false;
	showMain.value = false;
	showSettings.value = true;
}

const storedChannelOptions = store.get(StoreKeys.ChannelOptions);

function setShowMain() {
	store.set('channelOptions.channel', '');

	showChat.value = false;
	showMain.value = true;
	showSettings.value = false;
}
function setShowChat() {
	showChat.value = true;
	showMain.value = false;
	showSettings.value = false;
}
</script>

<template>
	<header>
		<DropDownMenu
			:store="store"
			@show-settings="setShowSetting"
			@show-main="setShowMain"
			@show-chat="setShowChat"
		/>
		<MenuButtons :store="store" @back="setShowMain" />
	</header>
	<main class="container-fluid">
		<Settings v-if="showSettings" />
		<Main v-else-if="showMain" />
		<Chat v-else-if="showChat" :channel-options="storedChannelOptions" />
	</main>
	<span id="version">{{ version }}</span>
</template>
