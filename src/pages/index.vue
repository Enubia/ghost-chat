<script setup lang="ts">
import External from '@components/index/External.vue';
import Kick from '@components/index/Kick.vue';
import Twitch from '@components/index/Twitch.vue';
</script>

<template>
    <div class="grid grid-cols-2 justify-center items-center pt-20 px-20 pb-10 gap-2 min-h-full">
        <Twitch />
        <Kick />
        <External />
    </div>
</template>
