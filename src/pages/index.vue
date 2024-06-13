<script setup lang="ts">
import External from '@components/index/External.vue';
import Kick from '@components/index/Kick.vue';
import Twitch from '@components/index/Twitch.vue';
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 justify-center items-center my-24 px-10 sm:px-20 gap-2">
        <Twitch />
        <Kick />
        <External />
    </div>
</template>
