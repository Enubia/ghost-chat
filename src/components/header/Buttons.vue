<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';

import Button from '#components/ui/button/Button.vue';
import { IpcEvent } from '#shared/constants';

const router = useRouter();
const route = useRoute();

const showVanish = ref(false);

const vanishWhiteList: typeof route.name[] = ['/webview/twitch', '/webview/kick', '/webview/externalsource'];

showVanish.value = vanishWhiteList.includes(route.name);

watch(route, () => {
    showVanish.value = vanishWhiteList.includes(route.name);
});
</script>

<template>
    <div>
        <Button v-if="showVanish" variant="ghost" class="rounded-none" @click="ipcRenderer.send(IpcEvent.Vanish)">
            <Icon icon="fa6-solid:ghost" />
        </Button>
        <Button variant="ghost" class="rounded-none" @click="router.push('/')">
            <Icon icon="fa6-solid:chevron-left" />
        </Button>
        <Button variant="ghost" class="rounded-none" @click="ipcRenderer.send(IpcEvent.Minimize)">
            <Icon icon="fa6-solid:down-left-and-up-right-to-center" />
        </Button>
        <Button
            variant="ghost"
            class="rounded-none hover:bg-destructive hover:text-background dark:hover:text-foreground"
            @click="ipcRenderer.send(IpcEvent.Close)"
        >
            <Icon icon="fa6-solid:xmark" />
        </Button>
    </div>
</template>
