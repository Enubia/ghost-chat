<script setup lang="ts">
const props = defineProps<{ tagSource: string }>();
</script>

<template>
    <div id="webview-tag">
        <webview
            :src="props.tagSource"
            class="min-h-[95dvh]"
        />
    </div>
</template>
