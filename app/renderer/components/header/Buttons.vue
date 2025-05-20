<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Button from '#components/ui/button/Button.vue';
import { IpcEvent } from '#ipc/constants/events';

const router = useRouter();
const route = useRoute();

const webviewRoutes: typeof route.name[] = ['/webview/twitch', '/webview/kick', '/webview/externalsource', '/webview/youtube'];

const showVanish = shallowRef(webviewRoutes.includes(route.name));
const showBack = shallowRef(webviewRoutes.includes(route.name));

watch(route, () => {
    showVanish.value = webviewRoutes.includes(route.name);
    showBack.value = route.name !== '/';
});
</script>

<template>
    <div>
        <Button v-if="showVanish" variant="ghost" class="rounded-none" @click="ipcRenderer.send(IpcEvent.Vanish)">
            <Icon icon="fa6-solid:ghost" />
        </Button>
        <Button v-if="showBack" variant="ghost" class="rounded-none" @click="router.push('/')">
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
