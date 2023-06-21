<template>
	<div class="center-elements">
		<input id="channel" v-model="source" type="text" @keydown.enter="emitSource" />
	</div>
	<div class="center-elements">
		<small id="info">{{ t('start.external.input.info') }}</small>
	</div>
	<div class="center-elements">
		<button @click="emitSource">{{ t('start.external.button') }}</button>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../../shared/types';
const { t } = useI18n();

const source = ref('');

defineProps<{ store: ElectronStore<AppStore> }>();

const emit = defineEmits<{ (event: 'source', source: string): void }>();

const emitSource = () => {
	if (source.value !== '') {
		const regex = new RegExp(/(http(s)?:\/\/).+/);

		if (!regex.test(source.value)) {
			source.value = `https://${source.value}`;
		}

		emit('source', source.value);
	}
};
</script>
