<template>
	<div id="start">
		<div class="center-elements">
			<img src="/icons/icon-128x128.png" />
		</div>
		<Twitch v-if="showTwitchInput" :store="store" @channel="($event) => $emit('channel', $event)" />
		<External v-else :store="store" @source="($event) => $emit('source', $event)" />
		<div class="center-elements">
			<small v-if="showTwitchInput" class="source-loader-info" @click="showTwitchInput = !showTwitchInput">
				{{ t('start.twitch.sourceSwitcher') }}
			</small>
			<small v-else class="source-loader-info" @click="showTwitchInput = !showTwitchInput">
				{{ t('start.external.sourceSwitcher') }}
			</small>
		</div>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../shared/types';
import External from '../components/start/External.vue';
import Twitch from '../components/start/Twitch.vue';

const { t } = useI18n();

const showTwitchInput = ref(true);

defineProps<{ store: ElectronStore<AppStore> }>();

defineEmits<{ (event: 'channel', channel: string): void; (event: 'source', source: string): void }>();
</script>
