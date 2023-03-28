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
import { ref } from 'vue';

import { IpcEvent } from '../shared/constants';
import { AppStore } from '../shared/types';

import MenuButtons from './components/header/Buttons.vue';
import DropDownMenu from './components/header/Dropdown.vue';
import Show from './helper/show';
import Chat from './pages/Chat.vue';
import Settings from './pages/Settings.vue';
import Start from './pages/Start.vue';
import VersionCheck from './pages/VersionCheck.vue';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const showStart = ref(true);
const showChat = ref(false);
const showSettings = ref(false);
const rerenderKey = ref(0);

const savedWindowState = ref(props.store.get('savedWindowState'));
const chatOptions = ref(props.store.get('chatOptions'));
const settings = ref(props.store.get('settings'));

const checkingVersion = ref(savedWindowState.value.isTransparent);

const $html = document.querySelector('html');

if (!$html?.getAttribute('data-theme')) {
	const theme = savedWindowState.value.theme;
	$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

const showApp = () => {
	document.querySelector('#app')?.removeAttribute('vanished');
};

const setShowStart = () => {
	Show.Start({ showChat, showStart, showSettings });
};

const setShowChat = () => {
	Show.Chat({ showChat, showStart, showSettings });
};

const enableChat = (channel: string) => {
	props.store.set('chatOptions.channel', channel);
	Show.Chat({ showChat, showStart, showSettings });
};

const vanish = () => {
	if (savedWindowState.value.isTransparent && chatOptions.value.channel !== '') {
		document.querySelector('#app')?.setAttribute('vanished', 'true');
		Show.Chat({ showChat, showStart, showSettings });
	}
};

if (settings.value.isOpen) {
	Show.Settings({ showChat, showStart, showSettings, checkingVersion });
}

ipcRenderer.on(IpcEvent.Rerender, () => rerenderKey.value++);
ipcRenderer.on(IpcEvent.Vanish, vanish);
ipcRenderer.on(IpcEvent.ShowApp, showApp);
</script>
