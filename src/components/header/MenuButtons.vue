<template>
	<div id="menu-buttons">
		<button id="back" class="secondary" @click="emit('back')">
			<font-awesome-icon icon="fa-solid fa-chevron-left" />
		</button>
		<button id="minimize" class="secondary" @click="minimize">
			<font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center" />
		</button>
		<button id="close" class="secondary" @click="close">
			<font-awesome-icon icon="fa-solid fa-xmark" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';

import { IpcConstants } from '../../../shared/constants';

defineProps<{ store: ElectronStore }>();

const emit = defineEmits(['back']);

function close() {
	ipcRenderer.send(IpcConstants.Close);
}

function minimize() {
	ipcRenderer.send(IpcConstants.Minimize);
}
</script>
