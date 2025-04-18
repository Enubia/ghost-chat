<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { onUnmounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { IpcEvent } from '#shared/constants';

const router = useRouter();

const { t } = useI18n();

const message = shallowRef(t('version-check.loading-message'));
const showLink = shallowRef(false);

ipcRenderer.on(IpcEvent.Recreated, () => {
    router.push('/');
});

ipcRenderer.on(IpcEvent.UpdateAvailable, (_, versionNumber) => {
    showLink.value = true;
    message.value = t('version-check.update-available', { version: versionNumber });
});

ipcRenderer.on(IpcEvent.UpdateNotAvailable, () => {
    router.push('/');
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
    ipcRenderer.removeAllListeners(IpcEvent.UpdateNotAvailable);
    ipcRenderer.removeAllListeners(IpcEvent.Error);
});
</script>

<template>
    <div class="center-elements m-auto h-dvh flex-col gap-2">
        <Icon icon="svg-spinners:blocks-wave" class="mb-5 text-5xl text-primary" />
        <span>{{ message }}</span>
        <a v-if="showLink" href="https://github.com/enubia/ghost-chat/releases/latest" class="text-primary underline">
            https://github.com/enubia/ghost-chat/releases/latest
        </a>
    </div>
</template>
