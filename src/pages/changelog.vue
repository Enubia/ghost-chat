<script setup lang="ts">
import fs from 'node:fs/promises';
import { onMounted, ref } from 'vue';
import markdownIt from 'markdown-it';

const html = ref('');

const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

onMounted(async () => {
    try {
        const file = await fs.readFile('CHANGELOG.md', 'utf-8');
        html.value = md.render(file);
    } catch (error) {
        console.error(error);
    }
});
</script>

<template>
    <div id="changelog" class="container" v-html="html" />
</template>
