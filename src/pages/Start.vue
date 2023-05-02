<template>
	<div id="start">
		<div class="center-elements">
			<img src="/icons/icon-128x128.png" />
		</div>
		<Twitch :store="store" @channel="($event) => $emit('channel', $event)" />
		<External :store="store" />
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';

import { AppStore } from '../../shared/types';
import External from '../components/start/External.vue';
import Twitch from '../components/start/Twitch.vue';

defineProps<{ store: ElectronStore<AppStore> }>();

defineEmits<{ (event: 'channel', channel: string): void; (event: 'source', source: string): void }>();
</script>
