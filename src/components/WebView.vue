<script setup lang="ts">
const props = defineProps<{ tagSource: string }>();
</script>

<template>
    <div class="h-screen w-screen">
        <webview
            :src="props.tagSource"
            style="display: inline-flex; width: 100%; height: 100%"
        />
    </div>
</template>
