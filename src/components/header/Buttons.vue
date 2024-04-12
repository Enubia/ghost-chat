<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { IpcEvent } from '@shared/constants';
import { useRoute, useRouter } from 'vue-router/auto';

const router = useRouter();
const route = useRoute();

const showBackButton = route.name === '/chat' || route.name === '/externalsource';
</script>

<template>
    <div id="menu-buttons">
        <button v-if="showBackButton" id="back" class="secondary" @click="router.push('/')">
            <font-awesome-icon icon="fas fa-chevron-left" />
        </button>
        <button id="minimize" class="secondary" @click="ipcRenderer.send(IpcEvent.Minimize)">
            <font-awesome-icon icon="fas fa-down-left-and-up-right-to-center" />
        </button>
        <button id="close" class="secondary" @click="ipcRenderer.send(IpcEvent.Close)">
            <font-awesome-icon icon="fas fa-xmark" />
        </button>
    </div>
</template>
