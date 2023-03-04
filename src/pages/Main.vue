<template>
	<div id="main">
		<div class="center-elements">
			<img src="/img/icons/icon-128x128.png" />
		</div>
		<div class="center-elements">
			<input
				id="channel"
				v-model="channel"
				type="text"
				@keydown.enter="channel !== '' && emit('channel', channel)"
			/>
		</div>
		<div class="center-elements">
			<small id="info">Enter a channel, e.g. enubia1</small>
		</div>
		<div class="center-elements">
			<button @click="channel !== '' && emit('channel', channel)">Go!</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';

import { AppStore } from '../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const emit = defineEmits<{ (event: 'channel', channel: string): void }>();

const channelOptions = shallowRef(props.store.get('channelOptions'));
const channel = ref('');

if (channelOptions.value.channel !== '') {
	channel.value = channelOptions.value.channel;
}

if (channelOptions.value.defaultChannel !== '') {
	channel.value === channelOptions.value.defaultChannel;
}
</script>
