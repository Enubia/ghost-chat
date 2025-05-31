<script setup lang="ts">
import External from '#components/index/External.vue';
import Kick from '#components/index/Kick.vue';
import Twitch from '#components/index/Twitch.vue';
import Youtube from '#components/index/Youtube.vue';

const components = [Twitch, Youtube, Kick, External];

const gridRows = components.length;
</script>

<template>
    <div class="flex items-center justify-center h-full">
        <div class="w-5/6 grid gap-4" :class="`grid-rows-${gridRows}`">
            <component :is="component" v-for="(component, index) in components" :key="index" />
        </div>
    </div>
</template>
