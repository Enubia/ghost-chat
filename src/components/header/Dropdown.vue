<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { Icon } from '@iconify/vue';
import { ipcRenderer } from 'electron';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router/auto';

import type { AppStore } from '@shared/types';

import { Button } from '@components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { IpcEvent } from '@shared/constants';

defineEmits(['vanish']);
const router = useRouter();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const isSettingsOpen = ref(electronStore.get('settings').isOpen);

function showSettings() {
    document.querySelector('details')?.removeAttribute('open');
    isSettingsOpen.value = true;
    ipcRenderer.send(IpcEvent.OpenSettings);
}

function toggleTheme() {
    const $html = document.querySelector('html');
    const isDarkTheme = $html?.classList.contains('dark');

    if (isDarkTheme) {
        $html?.classList.remove('dark');
        electronStore.set('savedWindowState.theme', 'light');
        electronStore.set('settings.savedWindowState.theme', 'light');
    } else {
        $html?.classList.add('dark');
        electronStore.set('savedWindowState.theme', 'dark');
        electronStore.set('settings.savedWindowState.theme', 'dark');
    }

    ipcRenderer.send(IpcEvent.Rerender, 'child');
}

ipcRenderer.on(IpcEvent.CloseSettings, () => {
    isSettingsOpen.value = false;
});
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="rounded-none">
                <Icon icon="fa6-solid:bars" class="text-2xl" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem @click="router.push('/')">
                {{ t('header.dropdown.start') }}
            </DropdownMenuItem>
            <DropdownMenuItem v-if="!isSettingsOpen" @click="showSettings">
                {{ t('header.dropdown.settings') }}
            </DropdownMenuItem>
            <DropdownMenuItem @click="toggleTheme">
                {{ t('header.dropdown.toggle-color-theme') }}
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.push('/changelog')">
                {{ t('header.dropdown.changelog') }}
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
