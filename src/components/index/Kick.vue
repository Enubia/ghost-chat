<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { Button } from '#components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '#components/ui/dialog';
import { Input } from '#components/ui/input';
import IpcHandler from '#lib/ipchandler';
import { StoreDefaults } from '#shared/constants';

const router = useRouter();
const { t } = useI18n();

const kick = ref(StoreDefaults.options.kick);
const channel = ref('');

onMounted(async () => {
    kick.value = await IpcHandler.getKickOptions();

    if (kick.value.channel !== '') {
        channel.value = kick.value.channel;
    }

    if (kick.value.defaultChannel !== '') {
        channel.value = kick.value.defaultChannel;
    }
});

async function routeChat() {
    if (!channel.value.length) {
        return;
    }

    await IpcHandler.setValueFromKey('options.kick.channel', channel.value);

    router.push('/webview/kick');
}
</script>

<template>
    <Dialog>
        <DialogTrigger>
            <div class="flex justify-center rounded p-4 hover:cursor-pointer hover:scale-105 bg-secondary shadow-xl">
                <img src="../../assets/brands/kick.png" class="h-12" alt="kick">
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
