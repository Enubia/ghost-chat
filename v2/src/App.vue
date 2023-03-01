<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { AppStore, IpcConstants } from '../shared/constants';

import Chat from './components/chat/Chat.vue';
import DropDownMenu from './components/header/DropDownMenu.vue';
import MenuButtons from './components/header/MenuButtons.vue';
import Main from './components/main/Main.vue';
import Settings from './components/settings/Settings.vue';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const version = ref('');
const showMain = ref(true);
const showChat = ref(false);
const showSettings = ref(false);
const savedWindowState = ref(props.store.get('savedWindowState'));
const channelOptions = ref(props.store.get('channelOptions'));
const settings = ref(props.store.get('settings'));

ipcRenderer.on('get-version', (_, args) => {
	version.value = `v${args}`;
});

const setShowMain = () => {
	showChat.value = false;
	showMain.value = true;
	showSettings.value = false;
};

const setShowChat = () => {
	showChat.value = true;
	showMain.value = false;
	showSettings.value = false;
};

const setShowSettings = () => {
	showChat.value = false;
	showMain.value = false;
	showSettings.value = true;
};

const vanishWindow = () => {
	ipcRenderer.send(IpcConstants.Vanish);
};

const enableChat = (channel: string) => {
	props.store.set('channelOptions.channel', channel);
	setShowChat();
};

if (savedWindowState.value.isTransparent && channelOptions.value.channel !== '') {
	setShowChat();
}

if (settings.value.isOpen) {
	setShowSettings();
}
</script>

<template>
	<header v-if="!savedWindowState.isTransparent && !settings.isOpen">
		<DropDownMenu
			:is-chat-page="showChat"
			:is-main-page="showMain"
			:channel="channelOptions.channel"
			:store="store"
			@show-main="setShowMain"
			@show-chat="setShowChat"
			@vanish="vanishWindow"
		/>
		<MenuButtons :store="store" @back="setShowMain" />
	</header>
	<main class="container-fluid">
		<Main v-if="showMain" @channel="enableChat" />
		<Chat v-else-if="showChat" :store="store" />
		<Settings v-else-if="showSettings" />
	</main>
	<span id="version">{{ version }}</span>
</template>
