<script setup lang="ts">
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { StoreDefaults } from '#ipc/constants/store';
import IpcHandler from '#lib/ipchandler';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';

const router = useRouter();
const { t } = useI18n();

const twitch = shallowRef(StoreDefaults.options.twitch);
const channel = shallowRef('');

onMounted(async () => {
    twitch.value = await IpcHandler.getTwitchOptions();

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

    await IpcHandler.setKeyValue('options.twitch.channel', channel.value);

    router.push('/webview/twitch');
}
</script>

<template>
    <Dialog>
        <DialogTrigger>
            <div class="flex justify-center rounded bg-secondary p-4 hover:cursor-pointer hover:bg-gray-400">
                <img src="../../assets/brands/twitch.png" class="h-12" alt="twitch">
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
