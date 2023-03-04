<template>
	<div id="beta-updates">
		<label for="beta-updates-input" class="align-elements">
			<input
				id="beta-updates-input"
				v-model="participateInPreRelease"
				type="checkbox"
				@change="setUpdateChannel"
			/>
			<span>Participate in pre-release version</span>
		</label>
		<small>
			Select if you want to participate in pre-release versions. Those will also be downloaded automatically if
			set.
		</small>
	</div>
</template>
<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';

import { AppStore } from '../../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const updater = shallowRef(props.store.get('updater'));

const participateInPreRelease = ref(false);

if (updater.value.channel !== 'latest') {
	participateInPreRelease.value = true;
}

const setUpdateChannel = () => {
	props.store.set('updater.channel', participateInPreRelease.value ? 'beta' : 'latest');
};
</script>
