<script setup lang="ts">
import { ipcRenderer } from 'electron';
import type ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

const props = defineProps<{
    isChatPage: boolean;
    isExternalPage: boolean;
    isStartPage: boolean;
    channel: string;
    store: ElectronStore<AppStore>;
}>();

const emit = defineEmits(['showStart', 'showSettings', 'showChangelog', 'vanish']);

const { t } = useI18n();

type EmitType = 'chat' | 'start' | 'changelog' | 'vanish';
type EmitKey = | 'showStart' | 'showSettings' | 'showChangelog' | 'vanish';

const isSettingsOpen = ref(false);

if (props.store.get('settings').isOpen) {
    isSettingsOpen.value = true;
}

function emitAndCloseMenu(emitType: EmitType) {
    document.querySelector('details')?.removeAttribute('open');
    const emitKey = emitType === 'vanish' ? emitType : `show${emitType.charAt(0).toUpperCase() + emitType.slice(1)}`;
    emit(emitKey as EmitKey);
}

function showSettings() {
    document.querySelector('details')?.removeAttribute('open');
    isSettingsOpen.value = true;
    ipcRenderer.send(IpcEvent.OpenSettings);
}

function toggleTheme() {
    const $html = document.documentElement;
    const theme = $html.classList.item(0);

    if (theme && theme === 'dark') {
        $html.classList.remove('dark');
        $html.classList.add('light');
        props.store.set('savedWindowState.theme', 'light');
        props.store.set('settings.savedWindowState.theme', 'light');
    } else {
        $html.classList.remove('light');
        $html.classList.add('dark');
        props.store.set('savedWindowState.theme', 'dark');
        props.store.set('settings.savedWindowState.theme', 'dark');
    }

    ipcRenderer.send(IpcEvent.Rerender, 'child');
}
</script>

<template>
    <div id="app-menu">
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button
                    variant="ghost"
                    rounded="none"
                >
                    <font-awesome-icon icon="fas fa-bars" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem v-if="!isStartPage" @click="emitAndCloseMenu('start')">
                    {{ t('header.dropdown.start') }}
                </DropdownMenuItem>
                <DropdownMenuItem v-if="!isSettingsOpen" @click="showSettings">
                    {{ t('header.dropdown.settings') }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="toggleTheme">
                    {{ t('header.dropdown.toggle-color-theme') }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="emitAndCloseMenu('changelog')">
                    {{ t('header.dropdown.changelog') }}
                </DropdownMenuItem>
                <DropdownMenuItem
                    v-if="!isSettingsOpen && (isChatPage || isExternalPage)"
                    id="vanish"
                    @click="emitAndCloseMenu('vanish')"
                >
                    <font-awesome-icon icon="fas fa-ghost" />
                    <span>{{ t('header.dropdown.vanish.title') }}</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>?</TooltipTrigger>
                            <TooltipContent>
                                <p>{{ t('header.dropdown.vanish.tooltip') }}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</template>
