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
		<small>
			You should choose a style that fits the game you're going to be playing. If you're an advanced user (meaning
			you know CSS), you can also choose to use "None" and style chat yourself in the Custom CSS section on the
			left.
		</small>
	</div>
	<div id="button-area">
		<button class="contrast" @click="save">Save</button>
	</div>
</template>
<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { IpcEvent } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const channelOptions = props.store.get('channelOptions');

const defaultChannel = ref(channelOptions.defaultChannel);
const fadeMessages = ref(channelOptions.fadeMessages);
const fadeTimeout = ref(channelOptions.fadeTimeout);
const showBotActivity = ref(channelOptions.showBotActivity);
const preventClipping = ref(channelOptions.preventClipping);
const chatTheme = ref(channelOptions.chatTheme);

const save = () => {
	props.store.set('channelOptions.showBotActivity', showBotActivity.value);
	props.store.set('channelOptions.fadeMessages', fadeMessages.value);

	if (fadeMessages.value) {
		props.store.set('channelOptions.fadeTimeout', fadeTimeout.value);
	}

	props.store.set('channelOptions.defaultChannel', defaultChannel.value);
	props.store.set('channelOptions.preventClipping', preventClipping.value);
	props.store.set('channelOptions.chatTheme', chatTheme.value);

	ipcRenderer.send(IpcEvent.Rerender, 'parent');
};
</script>
