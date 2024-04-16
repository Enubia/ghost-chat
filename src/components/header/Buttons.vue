<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';

import { IpcEvent } from '@shared/constants';

const router = useRouter();
const route = useRoute();

const showVanish = ref(route.name === '/twitch' || route.name === '/externalsource');

watch(route, () => {
    showVanish.value = route.name === '/twitch' || route.name === '/externalsource';
});
</script>

<template>
    <div id="menu-buttons">
        <button v-if="showVanish" id="back" class="secondary" @click="ipcRenderer.send(IpcEvent.Vanish)">
            <font-awesome-icon icon="fa fa-ghost" />
        </button>
        <button id="back" class="secondary" @click="router.push('/')">
            <font-awesome-icon icon="fa fa-chevron-left" />
        </button>
        <button id="minimize" class="secondary" @click="ipcRenderer.send(IpcEvent.Minimize)">
            <font-awesome-icon icon="fa fa-down-left-and-up-right-to-center" />
        </button>
        <button id="close" class="secondary" @click="ipcRenderer.send(IpcEvent.Close)">
            <font-awesome-icon icon="fa fa-xmark" />
        </button>
    </div>
</template>
