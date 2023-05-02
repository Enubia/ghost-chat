<template>
	<div class="center-elements">
		<button @click="source !== '' && emit('source', source)">{{ t('start.external.button') }}</button>
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
</script>
