<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router/auto';

import { IpcEvent } from '@shared/constants';

const router = useRouter();

const { t } = useI18n();

const message = ref(t('version-check.loading-message'));
const showManualDownloadMessage = ref(false);
const version = ref('');

ipcRenderer.on(IpcEvent.Recreated, () => {
    router.push('/');
});

ipcRenderer.on(IpcEvent.UpdateAvailable, (_, versionNumber) => {
    message.value = t('version-check.update-available', { version: versionNumber });
});

ipcRenderer.on(IpcEvent.ManualUpdateRequired, (_, versionNumber) => {
    showManualDownloadMessage.value = true;
    version.value = versionNumber;
});

ipcRenderer.on(IpcEvent.UpdateNotAvailable, () => {
    router.push('/');
});

ipcRenderer.on(IpcEvent.UpdateDownloaded, () => {
    message.value = t('version-check.download-finished');
    setTimeout(() => {
        router.push('/');
    }, 3000);
});

ipcRenderer.on(IpcEvent.Error, () => {
    message.value = t('version-check.error');
    setTimeout(() => {
        router.push('/');
    }, 3000);
});

// fallback in case something unpredictable happens
setTimeout(() => {
    router.push('/');
}, 5000);

// Cleanup, otherwise we'll have memory leaks (MaxListenersExceededWarning)
onUnmounted(() => {
    ipcRenderer.removeAllListeners(IpcEvent.Recreated);
    ipcRenderer.removeAllListeners(IpcEvent.UpdateAvailable);
    ipcRenderer.removeAllListeners(IpcEvent.ManualUpdateRequired);
    ipcRenderer.removeAllListeners(IpcEvent.UpdateNotAvailable);
    ipcRenderer.removeAllListeners(IpcEvent.UpdateDownloaded);
    ipcRenderer.removeAllListeners(IpcEvent.Error);
});
</script>

<template>
    <div class="center-elements flex-col py-[50%]">
        <Icon icon="svg-spinners:blocks-wave" class="text-5xl mb-5 text-primary" />
        <div v-if="!showManualDownloadMessage" class="center-elements container">
            <span>{{ message }}</span>
        </div>
        <div v-else class="center-elements container">
            <span class="text-justify">
                {{ t('version-check.manual-update-required.before-link', { version }) }}
                <a href="https://github.com/enubia/ghost-chat/releases" class="text-primary underline">
                    {{ t('version-check.manual-update-required.link') }}
                </a>
                {{ t('version-check.manual-update-required.after-link') }}
            </span>
        </div>
    </div>
</template>
