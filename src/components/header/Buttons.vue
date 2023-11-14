<template>
    <div id="menu-buttons">
        <button
            v-if="isChat || isExternal"
            id="back"
            class="secondary"
            @click="emit('back')"
        >
            <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>
        <button
            id="minimize"
            class="secondary"
            @click="ipcRenderer.send(IpcEvent.Minimize)"
        >
            <font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center" />
        </button>
        <button
            id="close"
            class="secondary"
            @click="ipcRenderer.send(IpcEvent.Close)"
        >
            <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';

import { IpcEvent } from '../../../shared/constants';

defineProps<{ store: ElectronStore; isChat: boolean; isExternal: boolean }>();

const emit = defineEmits(['back']);
</script>
