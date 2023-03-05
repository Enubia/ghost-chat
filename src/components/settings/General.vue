<template>
	<div id="beta-updates">
		<label for="beta-updates-input" class="align-elements">
			<input
				id="beta-updates-input"
				v-model="participateInPreRelease"
				type="checkbox"
				@change="setParticipateInPreRelease"
			/>
			<span>Participate in pre-release versions</span>
		</label>
		<small>
			Select if you want to participate in pre-release versions. Those will also be downloaded automatically if
			set.
		</small>
	</div>
	<div v-if="showCloseOption" id="close-option">
		<hr />
		<label for="close-option-input" class="align-elements">
			<input id="close-option-input" v-model="quitOnClose" type="checkbox" @change="setQuitOnClose" />
			<span>Quit on close button click</span>
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
const quitOnClose = ref(false);

const showCloseOption = process.platform === 'darwin';

if (updater.value.channel !== 'latest') {
	participateInPreRelease.value = true;
}

const setParticipateInPreRelease = () => {
	props.store.set('updater.channel', participateInPreRelease.value ? 'beta' : 'latest');
};

const setQuitOnClose = () => {
	props.store.set('general.quitOnClose', quitOnClose.value);
};
</script>
