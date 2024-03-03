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
        <Button
            v-if="isChat || isExternal"
            id="back"
            variant="ghost"
            @click="emit('back')"
        >
            <font-awesome-icon icon="fas fa-chevron-left" />
        </Button>
        <Button
            id="minimize"
            variant="ghost"
            @click="ipcRenderer.send(IpcEvent.Minimize)"
        >
            <font-awesome-icon icon="fas fa-down-left-and-up-right-to-center" />
        </Button>
        <Button
            id="close"
            variant="destructive"
            @click="ipcRenderer.send(IpcEvent.Close)"
        >
            <font-awesome-icon icon="fas fa-xmark" />
        </Button>
    </div>
</template>
