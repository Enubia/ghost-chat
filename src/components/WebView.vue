<script setup lang="ts">
const props = defineProps<{ tagSource: string }>();
</script>

<template>
    <div class="min-h-dvh w-full">
        <webview
            :src="props.tagSource"
            class="w-full h-full inline-flex pb-9"
        />
    </div>
</template>
