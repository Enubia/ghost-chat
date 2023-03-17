<template>
	<VersionCheck v-if="checkingVersion" @remove-loading="checkingVersion = !checkingVersion" />
	<header v-if="!savedWindowState.isTransparent && !settings.isOpen">
		<DropDownMenu
			:key="rerenderKey"
			:is-chat-page="showChat"
			:is-start-page="showStart"
			:channel="chatOptions.channel"
			:store="store"
			@show-start="setShowStart"
			@show-chat="setShowChat"
			@vanish="ipcRenderer.send(IpcEvent.Vanish)"
		/>
		<MenuButtons :store="store" :is-chat="showChat" @back="setShowStart" />
	</header>
	<main class="container-fluid">
		<Start v-if="showStart" :store="store" @channel="enableChat" />
		<Chat v-else-if="showChat" :store="store" />
		<Settings v-else-if="showSettings" :key="rerenderKey" />
	</main>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';

import { IpcEvent } from '../shared/constants';
import { AppStore } from '../shared/types';

import MenuButtons from './components/header/Buttons.vue';
import DropDownMenu from './components/header/Dropdown.vue';
import Chat from './pages/Chat.vue';
import Settings from './pages/Settings.vue';
import Start from './pages/Start.vue';
import VersionCheck from './pages/VersionCheck.vue';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const showStart = ref(true);
const showChat = ref(false);
const showSettings = ref(false);
const rerenderKey = ref(0);
const checkingVersion = ref(true);

let savedWindowState = shallowRef(props.store.get('savedWindowState'));
let chatOptions = shallowRef(props.store.get('chatOptions'));
let settings = shallowRef(props.store.get('settings'));

ipcRenderer.on(IpcEvent.Rerender, () => rerenderKey.value++);

const $html = document.querySelector('html');

if (!$html?.getAttribute('data-theme')) {
	const theme = props.store.get('savedWindowState.theme');
	$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

document.querySelector('#app')?.removeAttribute('vanished');

const setShowStart = () => {
	showChat.value = false;
	showStart.value = true;
	showSettings.value = false;
};

const setShowChat = () => {
	showChat.value = true;
	showStart.value = false;
	showSettings.value = false;
};

const setShowSettings = () => {
	showChat.value = false;
	showStart.value = false;
	showSettings.value = true;
	checkingVersion.value = false;
};

const enableChat = (channel: string) => {
	props.store.set('chatOptions.channel', channel);
	setShowChat();
};

if (savedWindowState.value.isTransparent && chatOptions.value.channel !== '') {
	document.querySelector('#app')?.setAttribute('vanished', 'true');
	setShowChat();
}

if (settings.value.isOpen) {
	setShowSettings();
}
</script>
