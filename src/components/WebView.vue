<template>
    <div id="webview-tag">
        <webview
            :src="props.tagSource"
            style="display: inline-flex; width: 100%; height: 100%"
        />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ tagSource: string }>();
</script>
