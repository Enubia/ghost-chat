<template>
	<VersionCheck v-if="checkingVersion" @remove-loading="checkingVersion = !checkingVersion" />
	<header v-if="!savedWindowState.isTransparent && !settings.isOpen">
		<DropDownMenu
			:is-chat-page="showChat"
			:is-main-page="showMain"
			:channel="channelOptions.channel"
			:store="store"
			@show-main="setShowMain"
			@show-chat="setShowChat"
			@vanish="vanish"
		/>
		<MenuButtons :store="store" :is-chat="showChat" @back="setShowMain" />
	</header>
	<main class="container-fluid">
		<Main v-if="showMain" :store="store" @channel="enableChat" />
		<Chat v-else-if="showChat" :store="store" />
		<Settings v-else-if="showSettings" :key="rerenderKey" />
	</main>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';

import { IpcConstants } from '../shared/constants';
import { AppStore } from '../shared/types';

import MenuButtons from './components/header/Buttons.vue';
import DropDownMenu from './components/header/Dropdown.vue';
import Chat from './pages/Chat.vue';
import Main from './pages/Main.vue';
import Settings from './pages/Settings.vue';
import VersionCheck from './pages/VersionCheck.vue';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const showMain = ref(true);
const showChat = ref(false);
const showSettings = ref(false);
const rerenderKey = ref(0);
const checkingVersion = ref(true);

let savedWindowState = shallowRef(props.store.get('savedWindowState'));
let channelOptions = shallowRef(props.store.get('channelOptions'));
let settings = shallowRef(props.store.get('settings'));

const forceRerender = () => {
	rerenderKey.value++;
};

ipcRenderer.on(IpcConstants.Rerender, forceRerender);

const $html = document.querySelector('html');

if (!$html?.getAttribute('data-theme')) {
	const theme = props.store.get('savedWindowState.theme');
	$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

document.querySelector('#app')?.removeAttribute('vanished');

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
	checkingVersion.value = false;
};

const vanish = () => {
	ipcRenderer.send(IpcConstants.Vanish);
};

const enableChat = (channel: string) => {
	props.store.set('channelOptions.channel', channel);
	setShowChat();
};

if (savedWindowState.value.isTransparent && channelOptions.value.channel !== '') {
	document.querySelector('#app')?.setAttribute('vanished', 'true');
	setShowChat();
}

if (settings.value.isOpen) {
	setShowSettings();
}
</script>
