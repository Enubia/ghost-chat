<script setup lang="ts">
import { StoreDefaults } from '#ipc/constants/store/defaults';
import * as IpcHandler from '#lib/ipchandler';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';

const router = useRouter();
const { t } = useI18n();

const kick = shallowRef(StoreDefaults.options.kick);
const channel = shallowRef('');

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

    await IpcHandler.setKeyValue('options.kick.channel', channel.value);

    router.push('/webview/kick');
}
</script>

<template>
    <Dialog>
        <DialogTrigger>
            <div class="flex justify-center p-4 rounded bg-secondary hover:cursor-pointer hover:bg-gray-400">
                <img
                    src="../../assets/brands/kick.png"
                    class="h-12"
                    alt="kick"
                />
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
            <Input
                v-model="channel"
                placeholder="Channel"
                @keydown.enter="routeChat"
            />
            <Button
                :disabled="!channel.length"
                @click="routeChat"
            >
                {{ t('start.channel.button') }}
            </Button>
        </DialogContent>
    </Dialog>
</template>
