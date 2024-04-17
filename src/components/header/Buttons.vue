<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';

import Button from '@components/ui/button/Button.vue';
import { IpcEvent } from '@shared/constants';

const router = useRouter();
const route = useRoute();

const showVanish = ref(false);

watch(route, () => {
    showVanish.value = route.name === '/twitch' || route.name === '/externalsource';
});
</script>

<template>
    <div>
        <Button v-if="showVanish" variant="ghost" class="rounded-none" @click="ipcRenderer.send(IpcEvent.Vanish)">
            <font-awesome-icon icon="fa fa-ghost" />
        </Button>
        <Button variant="ghost" class="rounded-none" @click="router.push('/')">
            <font-awesome-icon icon="fa fa-chevron-left" />
        </Button>
        <Button variant="ghost" class="rounded-none" @click="ipcRenderer.send(IpcEvent.Minimize)">
            <font-awesome-icon icon="fa fa-down-left-and-up-right-to-center" />
        </Button>
        <Button
            variant="ghost" class="rounded-none hover:bg-destructive hover:text-background dark:hover:text-foreground"
            @click="ipcRenderer.send(IpcEvent.Close)"
        >
            <font-awesome-icon icon="fa fa-xmark" />
        </Button>
    </div>
</template>
