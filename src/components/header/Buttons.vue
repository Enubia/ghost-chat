<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { IpcEvent } from '@shared/constants';

defineProps<{ isChat: boolean; isExternal: boolean }>();

defineEmits(['back']);
</script>

<template>
    <div id="menu-buttons">
        <button
            v-if="isChat || isExternal"
            id="back"
            class="secondary"
            @click="$emit('back')"
        >
            <font-awesome-icon icon="fas fa-chevron-left" />
        </button>
        <button
            id="minimize"
            class="secondary"
            @click="ipcRenderer.send(IpcEvent.Minimize)"
        >
            <font-awesome-icon icon="fas fa-down-left-and-up-right-to-center" />
        </button>
        <button
            id="close"
            class="secondary"
            @click="ipcRenderer.send(IpcEvent.Close)"
        >
            <font-awesome-icon icon="fas fa-xmark" />
        </button>
    </div>
</template>
