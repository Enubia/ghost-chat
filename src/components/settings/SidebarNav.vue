<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { Button } from '#components/ui/button';

const { t } = useI18n();
const route = useRoute();

const sidebarNavItems = [
    {
        title: t('settings.navigation.general'),
        link: '/settings/general',
    },
    {
        title: t('settings.navigation.twitch'),
        link: '/settings/twitch',
    },
    {
        title: t('settings.navigation.kick'),
        link: '/settings/kick',
    },
    {
        title: t('settings.navigation.external'),
        link: '/settings/external',
    },
];
</script>

<template>
    <nav class="sticky top-32 z-10 grid space-x-0 space-y-4 px-4">
        <RouterLink
            v-for="item in sidebarNavItems" :key="item.title" :to="item.link"
            class="w-full justify-start"
        >
            <Button variant="ghost" class="w-full justify-start" :class="route.name === item.link && 'bg-muted hover:bg-muted'">
                {{ item.title }}
            </Button>
        </RouterLink>
    </nav>
</template>
