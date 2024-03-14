<script setup lang="ts">
import { ipcRenderer } from 'electron';
import type ElectronStore from 'electron-store';

import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

defineProps<{ store: ElectronStore<AppStore>; isChat: boolean; isExternal: boolean }>();

const emit = defineEmits(['back']);
</script>

<template>
    <div id="menu-buttons">
        <button
            v-if="isChat || isExternal"
            id="back"
            class="secondary"
            @click="emit('back')"
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
