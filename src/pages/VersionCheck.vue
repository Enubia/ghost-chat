<template>
	<div id="version-check">
		<div>
			<div class="spinner">
				<div class="lds-roller">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
			<div>{{ message }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref } from 'vue';

import { IpcEvent } from '../../shared/constants';

const loadingMessages = ['Loading hot chat actions', 'Crunching latest numbers', 'Preparing new followers'];

const emit = defineEmits(['removeLoading']);

const message = ref(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

// ipcRenderer.on(IpcEvent.CheckingForUpdate, () => {});

ipcRenderer.on(IpcEvent.UpdateAvailable, (_, version) => {
	message.value = `Version ${version} is available, download will start automagically`;
});

ipcRenderer.on(IpcEvent.UpdateNotAvailable, () => {
	emit('removeLoading');
});

ipcRenderer.on(IpcEvent.UpdateDownloaded, () => {
	message.value = 'Download finished, new version will be applied on restart';
	setTimeout(() => {
		emit('removeLoading');
	}, 3000);
});

ipcRenderer.on(IpcEvent.Error, () => {
	message.value = 'Some error happened during download, please report this in the discord!';
	setTimeout(() => {
		emit('removeLoading');
	}, 3000);
});
</script>
