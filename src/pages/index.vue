<script setup lang="ts">
import External from '#components/index/External.vue';
import Kick from '#components/index/Kick.vue';
import Twitch from '#components/index/Twitch.vue';
</script>

<template>
    <div class="grid h-full grid-rows-4 px-10">
        <Twitch />
        <Kick />
        <External />
        <!-- placeholder for youtube -->
        <External />
    </div>
</template>
