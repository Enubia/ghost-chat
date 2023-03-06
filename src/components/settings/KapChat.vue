<template>
	<div id="default-channel">
		<label for="default-channel-input">
			<span>Default Channel</span>
			<input id="default-channel-input" v-model="defaultChannel" type="text" />
		</label>
		<small>In case a default channel is set the app will auto apply it for you.</small>
	</div>
	<hr />
	<div id="fade">
		<div class="control">
			<label class="align-elements" for="fade-input">
				<input id="fade-input" v-model="fadeMessages" type="checkbox" />
				<span>Fade</span>
			</label>
			<input v-if="fadeMessages" id="fade-timeout" v-model="fadeTimeout" type="number" />
		</div>
		<small>
			You can fade out old chat lines after a set number of seconds to keep stale content from remaining on
			screen.
		</small>
	</div>
	<hr />
	<div id="show-bots">
		<label class="align-elements" for="show-bots-input">
			<input id="show-bots-input" v-model="showBotActivity" type="checkbox" />
			<span>Show Bots</span>
		</label>
		<small>KapChat hides bot messages by default, but you can turn them back on.</small>
	</div>
	<hr />
	<div id="prevent-clipping">
		<label class="align-elements" for="prevent-clipping-input">
			<input id="prevent-clipping-input" v-model="preventClipping" type="checkbox" />
			<span>Prevent Clipping</span>
		</label>
		<small>
			You can prevent the clipping of chat lines, but it is disabled by default for performance reasons. If you
			have a large channel, you might not want to enable this.
		</small>
	</div>
	<hr />
	<div id="chat-theme">
		<label for="theme-select">
			Chat Theme
			<select id="theme-select" v-model="chatTheme">
				<option value="undefined" selected>None</option>
				<option value="dark">Dark</option>
				<option value="light">Light</option>
				<option value="bttv_light">BetterTTV Light</option>
				<option value="bttv_dark">BetterTTV Dark</option>
				<option value="s0n0s_1080">S0N0S' 1080P Theme</option>
				<option value="s0n0s_1440">S0N0S' 1440P Theme</option>
			</select>
		</label>
		<div v-if="chatTheme !== oldTheme">
			<small class="info">
				Please note that in order for the theme to apply you'll need to exit the chat and join again.
			</small>
			<br />
		</div>
		<small>
			You should choose a style that fits the game you're going to be playing. If you're an advanced user (meaning
			you know CSS), you can also choose to use "None" and style chat yourself in the Custom CSS section on the
			left. The selectors available can be found on the
			<a
				href="https://nightdev.com/hosted/obschat?theme=undefined&channel=esamarathon&fade=false&bot_activity=false&prevent_clipping=false"
			>
				KapChat generated page</a
			>, just open the developer tools and inspect the page.
		</small>
	</div>
	<div id="button-area">
		<button id="save" class="contrast" @click="save">Save</button>
	</div>
</template>
<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { IpcEvent } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const chatOptions = props.store.get('chatOptions');

const defaultChannel = ref(chatOptions.defaultChannel);
const fadeMessages = ref(chatOptions.fadeMessages);
const fadeTimeout = ref(chatOptions.fadeTimeout);
const showBotActivity = ref(chatOptions.showBotActivity);
const preventClipping = ref(chatOptions.preventClipping);
const oldTheme = chatOptions.chatTheme;
const chatTheme = ref(chatOptions.chatTheme);

const save = () => {
	const $saveButton = document.querySelector('#save') as HTMLElement;

	$saveButton.setAttribute('aria-busy', 'true');
	$saveButton.innerText = 'Saving...';

	props.store.set('chatOptions.showBotActivity', showBotActivity.value);
	props.store.set('chatOptions.fadeMessages', fadeMessages.value);

	if (fadeMessages.value) {
		props.store.set('chatOptions.fadeTimeout', fadeTimeout.value);
	}

	props.store.set('chatOptions.defaultChannel', defaultChannel.value);
	props.store.set('chatOptions.preventClipping', preventClipping.value);
	props.store.set('chatOptions.chatTheme', chatTheme.value);

	ipcRenderer.send(IpcEvent.Rerender, 'parent');

	setTimeout(() => {
		$saveButton?.removeAttribute('aria-busy');
		$saveButton.innerText = 'Save';
	}, 500);
};
</script>
