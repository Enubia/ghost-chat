<template>
	<div></div>
</template>
<script setup lang="ts">
import ElectronStore from 'electron-store';

import { AppStore } from '../../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

console.log(props.store.get('channelOptions.persistentChannel'));
</script>
