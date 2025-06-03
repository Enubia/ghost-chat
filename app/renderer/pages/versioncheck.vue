<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useIpcRendererOn } from '@vueuse/electron';
import { shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '#components/ui/button/Button.vue';
import { IpcEvent } from '#ipc/constants/events';

import { downloadLink } from '../constants/links';
import { versionStore } from '../store/version';

const router = useRouter();

const { t } = useI18n();

const message = shallowRef(t('version-check.loading-message'));
const showLink = shallowRef(false);
const immediateRedirect = shallowRef(false);

const redirectTimeout = setTimeout(() => {
    router.push('/');
}, 5000);

useIpcRendererOn(IpcEvent.UpdateNotAvailable, () => {
    immediateRedirect.value = true;
});

useIpcRendererOn(IpcEvent.UpdateAvailable, (_, versionNumber) => {
    showLink.value = true;
    versionStore.setNew(versionNumber);
    message.value = t('version-check.update-available', {
        version: versionNumber,
    });
});

useIpcRendererOn(IpcEvent.Error, () => {
    message.value = t('version-check.error');
});

watch(immediateRedirect, (val) => {
    if (val) {
        clearTimeout(redirectTimeout);
        router.push('/');
    }
});
</script>

<template>
    <div class="flex-col gap-2 m-auto center-elements h-dvh">
        <Icon
            icon="svg-spinners:ring-resize"
            class="mb-5 text-5xl"
            style="color: #762ce6"
        />
        <span class="text-center">{{ message }}</span>
        <a
            v-if="showLink"
            :href="downloadLink"
            class="center-elements"
        >
            <Button
                variant="secondary"
                class="mt-5"
            >
                {{ t('version-check.download-link') }}
                <Icon
                    icon="mdi:open-in-new"
                    class="ml-2"
                />
            </Button>
        </a>
    </div>
</template>
