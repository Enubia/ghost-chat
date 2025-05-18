<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useFetch } from '@vueuse/core';
import { computed, onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { StoreDefaults } from '#ipc/constants/store/defaults';
import IpcHandler from '#lib/ipchandler';
import { delay } from '#lib/utils/delay';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';

const router = useRouter();
const { t } = useI18n();

const youtube = shallowRef(StoreDefaults.options.youtube);
const channelId = shallowRef('');
const info = shallowRef(t('start.channel.id.info'));
const isLoading = shallowRef(false);
const retries = shallowRef(youtube.value.retries || StoreDefaults.options.youtube.retries);

const { abort, error, data, execute } = useFetch(
    computed(() => `https://www.youtube.com/embed/live_stream?channel=${channelId.value}`),
    { immediate: false },
).get().text();

onMounted(async () => {
    youtube.value = await IpcHandler.getYoutubeOptions();

    if (youtube.value.channelId !== '') {
        channelId.value = youtube.value.channelId;
    }

    if (youtube.value.defaultChannelId !== '') {
        channelId.value = youtube.value.defaultChannelId;
    }
});

const TIMEOUT_EXCEEDED = 'timeout-exceeded' as const;
const UNEXPECTED_ERROR = 'unexpected-error' as const;

async function getYoutubeChatURL() {
    const FETCH_DELAY = 1000 * (youtube.value.fetchDelay || StoreDefaults.options.youtube.fetchDelay);

    do {
        await execute();

        if (error.value) {
            return UNEXPECTED_ERROR;
        }

        const videoId = data.value?.match(/"VIDEO_ID":"(.*?)"/)?.at(1);

        if (videoId && videoId !== 'live_stream') {
            return new URL(`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`);
        } else {
            retries.value--;
            await delay(FETCH_DELAY);
        }
    } while (retries.value > 0);

    abort();

    return TIMEOUT_EXCEEDED;
}

async function routeChat() {
    if (!channelId.value.length) {
        return;
    }

    isLoading.value = true;

    const result = await getYoutubeChatURL();

    switch (result) {
        case 'timeout-exceeded':
            info.value = t('start.channel.id.timeout-exceeded');
            break;
        case 'unexpected-error':
            info.value = t('start.channel.id.unexpected-error');
            break;
        default:
            await IpcHandler.setKeyValue('options.youtube.channelId', channelId.value);
            await IpcHandler.setKeyValue('options.youtube.videoUrl', result.href);
            router.push('/webview/youtube');
            break;
    }

    isLoading.value = false;
}

function stopLoading() {
    abort();
    retries.value = 0;
    isLoading.value = false;

    setTimeout(() => {
        info.value = t('start.channel.id.info');
    });
}
</script>

<template>
    <Dialog @update:open="open => open ? null : stopLoading()">
        <DialogTrigger>
            <div class="flex justify-center rounded bg-secondary p-4 hover:cursor-pointer hover:bg-gray-400">
                <Icon icon="fa6-brands:youtube" color="#FF0000" class="size-12" />
            </div>
        </DialogTrigger>
        <DialogContent class="w-3/4 rounded">
            <DialogHeader class="text-start">
                <DialogTitle>
                    {{ t('start.youtube.title') }}
                </DialogTitle>
                <DialogDescription class="grid gap-3">
                    {{ info }}
                </DialogDescription>
            </DialogHeader>
            <Input v-model="channelId" placeholder="Your youtube channel Id" @keydown.enter="routeChat" />
            <Button :disabled="!channelId.length || isLoading" class="flex gap-2" @click="routeChat">
                {{ t('start.channel.button') }}
                <Icon v-if="isLoading" icon="svg-spinners:6-dots-rotate" class="animate-spin text-2xl" />
            </Button>
        </DialogContent>
    </Dialog>
</template>
