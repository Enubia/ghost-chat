<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router/auto';

import type { AppStore } from '@shared/types';

import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { Input } from '@components/ui/input';

const router = useRouter();
const { t } = useI18n();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const chatOptions = ref(electronStore.get('chatOptions'));
const channel = ref('');

if (chatOptions.value.channel !== '') {
    channel.value = chatOptions.value.channel;
}

if (chatOptions.value.defaultChannel !== '') {
    channel.value = chatOptions.value.defaultChannel;
}

function routeChat() {
    if (!channel.value.length) {
        return;
    }

    electronStore.set('chatOptions', {
        ...chatOptions.value,
        channel: channel.value,
    });

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
