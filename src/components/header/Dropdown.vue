<script setup lang="ts">
import { Icon } from '@iconify/vue';
import IpcHandler from '@lib/ipchandler';
import { ipcRenderer } from 'electron';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router/auto';

import { Button } from '@components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { IpcEvent } from '@shared/constants';

defineEmits(['vanish']);

const router = useRouter();

const { t } = useI18n();

const isSettingsOpen = ref(false);

onBeforeMount(async () => {
    isSettingsOpen.value = (await IpcHandler.getSettings()).isOpen;
});

function showSettings() {
    document.querySelector('details')?.removeAttribute('open');
    isSettingsOpen.value = true;
    ipcRenderer.send(IpcEvent.OpenSettings);
}

async function toggleTheme() {
    const $html = document.querySelector('html');
    const isDarkTheme = $html?.classList.contains('dark');
    let theme = '';

    if (isDarkTheme) {
        $html?.classList.remove('dark');
        await IpcHandler.setValueFromKey('savedWindowState.theme', 'light');
        await IpcHandler.setValueFromKey('settings.savedWindowState.theme', 'light');
        theme = 'light';
    } else {
        $html?.classList.add('dark');
        await IpcHandler.setValueFromKey('savedWindowState.theme', 'dark');
        await IpcHandler.setValueFromKey('settings.savedWindowState.theme', 'dark');
        theme = 'dark';
    }

    ipcRenderer.send(IpcEvent.ThemeChanged, theme);
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
