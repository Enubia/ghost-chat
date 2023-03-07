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
			<div v-if="!showManualDownloadMessage" class="center-elements">
				<span id="message">{{ message }}</span>
			</div>
			<div v-else class="center-elements">
				<span id="message">
					{{ t('version-check.manual-update-required.before-link', { version }) }}
					<a href="https://github.com/enubia/ghost-chat/releases">
						{{ t('version-check.manual-update-required.link') }}
					</a>
					{{ t('version-check.manual-update-required.after-link') }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { IpcEvent } from '../../shared/constants';

const { t } = useI18n();

const emit = defineEmits(['removeLoading']);

const message = ref(t('version-check.loading-message'));
const showManualDownloadMessage = ref(false);
const version = ref('');

ipcRenderer.on(IpcEvent.Recreated, () => emit('removeLoading'));

ipcRenderer.on(IpcEvent.UpdateAvailable, (_, versionNumber) => {
	message.value = t('version-check.update-available', { version: versionNumber });
});

ipcRenderer.on(IpcEvent.ManualUpdateRequired, (_, versionNumber) => {
	showManualDownloadMessage.value = true;
	version.value = versionNumber;
});

ipcRenderer.on(IpcEvent.UpdateNotAvailable, () => {
	emit('removeLoading');
});

ipcRenderer.on(IpcEvent.UpdateDownloaded, () => {
	message.value = t('version-check.download-finished');
	setTimeout(() => {
		emit('removeLoading');
	}, 3000);
});

ipcRenderer.on(IpcEvent.Error, () => {
	message.value = t('version-check.error');
	setTimeout(() => {
		emit('removeLoading');
	}, 3000);
});

// fallback in case something unpredictable happens
setTimeout(() => {
	emit('removeLoading');
}, 10000);
</script>
