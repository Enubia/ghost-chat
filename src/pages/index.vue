<script setup lang="ts">
import External from '#components/index/External.vue';
import Kick from '#components/index/Kick.vue';
import Twitch from '#components/index/Twitch.vue';
</script>

<template>
    <div class="my-12 grid grid-cols-1 items-center justify-center gap-2 px-10 sm:grid-cols-2">
        <Twitch />
        <Kick />
        <External />
    </div>
</template>
