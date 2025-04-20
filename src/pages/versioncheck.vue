<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { onUnmounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '#components/ui/button/Button.vue';
import { downloadLink, IpcEvent } from '#shared/constants';

import { versionState } from '../state/version';

const router = useRouter();

const { t } = useI18n();

const message = shallowRef(t('version-check.loading-message'));
const showLink = shallowRef(false);

ipcRenderer.on(IpcEvent.UpdateAvailable, (_, versionNumber) => {
    showLink.value = true;
    versionState.setNew(versionNumber);
    message.value = t('version-check.update-available', { version: versionNumber });
});

ipcRenderer.on(IpcEvent.Error, () => {
    message.value = t('version-check.error');
});

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
        <Icon icon="svg-spinners:blocks-wave" class="mb-5 text-5xl" style="color: #762ce6" />
        <span class="text-center">{{ message }}</span>
        <a v-if="showLink" :href="downloadLink" class="center-elements">
            <Button
                variant="secondary"
                class="mt-5"
            >
                {{ t('version-check.download-link') }}
                <Icon icon="mdi:open-in-new" class="ml-2" />
            </Button>
        </a>
    </div>
</template>
