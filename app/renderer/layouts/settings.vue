<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import SidebarNav from '#components/settings/SidebarNav.vue';

import { Separator } from '../components/ui/separator';
import IpcHandler from '../lib/ipchandler';

const { t } = useI18n();

onMounted(async () => {
    const theme = (await IpcHandler.getWindowState()).theme;
    const $html = document.querySelector('html');

    $html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
});
</script>

<template>
    <div class="px-10">
        <div class="sticky top-0 z-10 bg-background py-6">
            <h2 class="text-2xl font-bold tracking-tight">
                {{ t('settings.title') }}
            </h2>
            <p class="text-muted-foreground">
                {{ t('settings.info') }}
            </p>
            <Separator />
        </div>
        <div class="flex gap-2">
            <aside>
                <SidebarNav />
            </aside>
            <div class="min-w-52 pb-4">
                <div class="space-y-6">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>
