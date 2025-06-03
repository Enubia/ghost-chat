<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import SidebarNav from '#components/settings/SidebarNav.vue';

import { Separator } from '../components/ui/separator';

const { t } = useI18n();
</script>

<template>
    <div class="px-10">
        <div class="sticky top-0 z-10 py-6 bg-background">
            <h2 class="text-2xl font-bold tracking-tight">
                {{ t('settings.title') }}
            </h2>
            <p class="text-muted-foreground">
                {{ t('settings.info') }}
            </p>
            <Separator />
        </div>
        <div class="flex gap-6">
            <aside>
                <SidebarNav />
            </aside>
            <div class="w-full pb-4">
                <div class="space-y-6">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>
