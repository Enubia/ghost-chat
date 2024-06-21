<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import SidebarNav from '#components/settings/SidebarNav.vue';
import { Separator } from '#components/ui/separator';
import IpcHandler from '#lib/ipchandler';

const { t } = useI18n();

onMounted(async () => {
    const theme = (await IpcHandler.getWindowState()).theme;
    const $html = document.querySelector('html');

    $html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
});
</script>

<template>
    <div class="space-y-6 p-10 block">
        <div class="space-y-0.5">
            <h2 class="text-2xl font-bold tracking-tight">
                {{ t('settings.title') }}
            </h2>
            <p class="text-muted-foreground">
                {{ t('settings.info') }}
            </p>
            <Separator />
        </div>
        <div class="flex space-y-8 space-x-12">
            <aside class="w-1/6">
                <SidebarNav />
            </aside>
            <div class="w-5/6">
                <div class="space-y-6 relative">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>
