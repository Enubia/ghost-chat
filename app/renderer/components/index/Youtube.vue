<script setup lang="ts">
import { StoreDefaults } from '#ipc/constants/store/defaults';
import IpcHandler from '#lib/ipchandler';
import { delay } from '#lib/utils/delay';
import { Icon } from '@iconify/vue';
import { useFetch } from '@vueuse/core';
import { computed, onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';

const router = useRouter();
const { t } = useI18n();

const youtube = shallowRef(StoreDefaults.options.youtube);
const channelId = shallowRef('');
const liveId = shallowRef('');
const info = shallowRef(t('start.youtube.channel-id.info'));
const isLoading = shallowRef(false);
const isModalOpen = shallowRef(true);
const remaining = shallowRef(youtube.value.retries ?? StoreDefaults.options.youtube.retries);

const { abort, error, data, execute } = useFetch(
    computed(() => `https://www.youtube.com/embed/live_stream?channel=${channelId.value}`),
    { immediate: false },
)
    .get()
    .text();

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

function resetRemainingTries() {
    // reset remaining to initial value so that we can try it again later on
    // if this doesn't happen and the user closes the modal,
    // it will only try once because the component wasn't rerendered and the value is still 0
    remaining.value = youtube.value.retries ?? StoreDefaults.options.youtube.retries;
}

async function getYoutubeChatURL() {
    const FETCH_DELAY = 1000 * (youtube.value.fetchDelay ?? StoreDefaults.options.youtube.fetchDelay);

    do {
        await execute();

        if (error.value) {
            resetRemainingTries();
            return UNEXPECTED_ERROR;
        }

        const videoId = data.value?.match(/"VIDEO_ID":"(.*?)"/)?.at(1);

        if (videoId && videoId !== 'live_stream') {
            return new URL(`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`);
        } else {
            remaining.value--;
            info.value = t('start.youtube.channel-id.fetching-state');
            await delay(FETCH_DELAY);
        }
    } while (remaining.value > 0);

    resetRemainingTries();

    if (isModalOpen.value) {
        abort();

        return TIMEOUT_EXCEEDED;
    }
}

async function routeChat() {
    if (liveId.value.length) {
        const url = new URL(`https://www.youtube.com/live_chat?is_popout=1&v=${liveId.value}`);

        await IpcHandler.setKeyValue('options.youtube.videoUrl', url.href);

        return router.push('/webview/youtube');
    }

    if (!channelId.value.length) {
        return;
    }

    isLoading.value = true;

    const result = await getYoutubeChatURL();

    if (!result) {
        info.value = t('start.youtube.channel-id.info');
        return;
    }

    switch (result) {
        case 'timeout-exceeded':
            info.value = t('start.youtube.channel-id.timeout-exceeded');
            break;
        case 'unexpected-error':
            info.value = t('start.youtube.channel-id.unexpected-error');
            break;
        default:
            await IpcHandler.setKeyValue('options.youtube.channelId', channelId.value);
            await IpcHandler.setKeyValue('options.youtube.videoUrl', result.href);
            return router.push('/webview/youtube');
    }

    isLoading.value = false;
}

function stopLoading() {
    abort();

    // this has to be set so that the loop execution halts when the dialog is closed manually
    remaining.value = 0;
    isModalOpen.value = false;
    isLoading.value = false;
    info.value = t('start.youtube.channel-id.info');
}
</script>

<template>
    <Dialog @update:open="(open) => (open ? null : stopLoading())">
        <DialogTrigger>
            <div class="flex justify-center p-4 rounded bg-secondary hover:cursor-pointer hover:bg-gray-400">
                <Icon
                    icon="fa6-brands:youtube"
                    color="#FF0000"
                    class="size-12"
                />
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
            <Input
                v-model="channelId"
                :disabled="isLoading"
                placeholder="Your youtube channel Id"
                @keydown.enter="routeChat"
            />
            <Button
                :disabled="!channelId.length || isLoading"
                class="flex gap-2"
                @click="routeChat"
            >
                {{ t('start.channel.button') }}
                <Icon
                    v-if="isLoading"
                    icon="svg-spinners:6-dots-rotate"
                    class="text-2xl animate-spin"
                />
            </Button>
            <hr class="border-dashed" />
            <DialogDescription class="grid gap-3">
                {{ t('start.youtube.live-id.info') }}
            </DialogDescription>
            <Input
                v-model="liveId"
                :disabled="isLoading"
                placeholder="Your youtube live Id"
                @keydown.enter="routeChat"
            />
            <Button
                :disabled="isLoading"
                class="flex gap-2"
                @click="routeChat"
            >
                {{ t('start.channel.button') }}
            </Button>
        </DialogContent>
    </Dialog>
</template>
