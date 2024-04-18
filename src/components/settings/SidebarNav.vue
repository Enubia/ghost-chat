<script setup lang="ts">
import { useRoute } from 'vue-router/auto';

import { Button } from '@components/ui/button';

const route = useRoute();

const sidebarNavItems = [
    {
        title: 'General',
        link: '/settings/general',
    },
    {
        title: 'Twitch.tv',
        link: '/settings/twitch',
    },
    {
        title: 'CSS Editor',
        link: '/settings/css',
    },
    {
        title: 'JS Editor',
        link: '/settings/js',
    },
];
</script>

<template>
    <nav class="grid space-x-0 space-y-4">
        <RouterLink
            v-for="item in sidebarNavItems" :key="item.title" :to="item.link"
            class="w-full text-left justify-start"
        >
            <Button variant="ghost" class="w-full" :class="route.name === item.link && 'bg-muted hover:bg-muted'">
                {{ item.title }}
            </Button>
        </RouterLink>
    </nav>
</template>
