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

const { kick } = electronStore.get('options');
const channel = ref('');

if (kick.channel !== '') {
    channel.value = kick.channel;
}

if (kick.defaultChannel !== '') {
    channel.value = kick.defaultChannel;
}

function routeChat() {
    if (!channel.value.length) {
        return;
    }

    electronStore.set('chatOptions', {
        ...kick,
        channel: channel.value,
    });

    router.push('/kick');
}
</script>

<template>
    <Dialog>
        <DialogTrigger>
            <div class="flex justify-center rounded p-4 hover:cursor-pointer hover:scale-105 bg-secondary shadow-xl">
                <img src="../../assets/brands/kick.png" class="h-12">
            </div>
        </DialogTrigger>
        <DialogContent class="w-3/4 rounded">
            <DialogHeader class="text-start">
                <DialogTitle>
                    {{ t('start.kick.title') }}
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
