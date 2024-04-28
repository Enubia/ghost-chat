<script setup lang="ts">
defineProps<{ tagSource: URL }>();
</script>

<template>
    <div id="webview-tag">
        <webview
            :src="tagSource"
            class="min-h-[95dvh]"
        />
    </div>
</template>
