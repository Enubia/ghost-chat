<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { StoreDefaults } from '#ipc/constants/store';
import IpcHandler from '#lib/ipchandler';
import { getYoutubeChatURL } from '#lib/youtube';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';

const router = useRouter();
const { t } = useI18n();

const youtube = shallowRef(StoreDefaults.options.youtube);
const channelId = shallowRef('');
const info = shallowRef(t('start.channel.id.info'));
const isLoading = shallowRef(false);

onMounted(async () => {
    youtube.value = await IpcHandler.getYoutubeOptions();

    if (youtube.value.channelId !== '') {
        channelId.value = youtube.value.channelId;
    }

    if (youtube.value.defaultChannel !== '') {
        channelId.value = youtube.value.defaultChannelId;
    }
});

async function routeChat() {
    if (!channelId.value.length) {
        return;
    }

    isLoading.value = true;
    const result = await getYoutubeChatURL(channelId.value, youtube.value);

    switch (result) {
        case 'timeout-exceeded':
            info.value = t('start.channel.id.timeout-exceeded');
            break;
        case 'unexpected-error':
            info.value = t('start.channel.id.unexpected-error');
            break;
        default:
            await IpcHandler.setKeyValue('options.youtube.video_url', result.href);
            router.push('/webview/youtube');
            break;
    }

    isLoading.value = false;
}
</script>

<template>
    <Dialog v-on:update:open="">
        <DialogTrigger>
            <div class="flex justify-center rounded bg-secondary p-4 hover:cursor-pointer hover:bg-gray-400">
                <Icon icon="fa:youtube-play" color="#FF0000" class="size-12" />
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
                <Icon v-if="isLoading" icon="fa:spinner" class="animate-spin text-2xl" />
            </Button>
        </DialogContent>
    </Dialog>
</template>
