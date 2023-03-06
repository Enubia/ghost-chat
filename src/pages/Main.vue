<template>
	<div id="main">
		<div class="center-elements">
			<img src="/icons/icon-128x128.png" />
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
			<small id="info">{{ t('main.input.info') }}</small>
		</div>
		<div class="center-elements">
			<button @click="channel !== '' && emit('channel', channel)">{{ t('main.button') }}</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../shared/types';

const { t } = useI18n();

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const emit = defineEmits<{ (event: 'channel', channel: string): void }>();

const chatOptions = ref(props.store.get('chatOptions'));
const channel = ref('');

if (chatOptions.value.channel !== '') {
	channel.value = chatOptions.value.channel;
}

if (chatOptions.value.defaultChannel !== '') {
	channel.value = chatOptions.value.defaultChannel;
}
</script>
