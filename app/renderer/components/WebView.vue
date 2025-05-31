<script setup lang="ts">
defineProps<{ tagSource: URL }>();
</script>

<template>
    <webview :src="tagSource" class="min-h-dvh" />
</template>
