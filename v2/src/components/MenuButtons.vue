<script setup lang="ts">
import { ipcRenderer } from 'electron';

import { IpcConstants } from '../../shared/constants';

defineProps<{ isChatPage: boolean }>();

function close() {
	ipcRenderer.send(IpcConstants.Close);
}

function minimize() {
	ipcRenderer.send(IpcConstants.Minimize);
}

function back() {
	ipcRenderer.send(IpcConstants.Back);
}
</script>

<template>
	<div id="menu-buttons">
		<button v-if="isChatPage" id="back" class="secondary" @click="back">
			<font-awesome-icon icon="fa-solid fa-chevron-left" />
		</button>
		<button id="minimize" class="secondary" @click="minimize">
			<font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center" />
		</button>
		<button id="close" @click="close">
			<font-awesome-icon icon="fa-solid fa-xmark" />
		</button>
	</div>
</template>
