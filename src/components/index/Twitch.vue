<script setup lang="ts">
import IpcHandler from '@lib/ipchandler';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router/auto';

import type { Twitch } from '@shared/types';

import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { Input } from '@components/ui/input';

const router = useRouter();
const { t } = useI18n();

const twitch = ref({} as Twitch);
const channel = ref('');

onMounted(async () => {
    twitch.value = (await IpcHandler.getOptions()).twitch;

    if (twitch.value.channel !== '') {
        channel.value = twitch.value.channel;
    }

    if (twitch.value.defaultChannel !== '') {
        channel.value = twitch.value.defaultChannel;
    }
});

async function routeChat() {
    if (!channel.value.length) {
        return;
    }

    await IpcHandler.setValueFromKey('options.twitch.channel', channel.value);

    router.push('/webview/twitch');
}
</script>

<template>
    <Dialog>
        <DialogTrigger>
            <div class="flex justify-center rounded p-4 hover:cursor-pointer hover:scale-105 bg-secondary shadow-xl">
                <img src="../../assets/brands/twitch.png" class="h-12">
            </div>
        </DialogTrigger>
        <DialogContent class="w-3/4 rounded">
            <DialogHeader class="text-start">
                <DialogTitle>
                    {{ t('start.twitch.title') }}
                </DialogTitle>
                <DialogDescription class="grid gap-3">
                    {{ t('start.channel.info') }}
                </DialogDescription>
            </DialogHeader>
            <Input v-model="channel" placeholder="Channel" @keydown.enter="routeChat" />
            <Button :disabled="!channel.length" @click="routeChat">
                {{ t('start.channel.button') }}
            </Button>
        </DialogContent>
    </Dialog>
</template>
