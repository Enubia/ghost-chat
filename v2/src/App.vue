<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';

// postMessage({ payload: 'removeLoading' }, '*');

// console.log('[App.vue]', `Hello world from Electron ${process.versions.electron}!`);
</script>

<template>
	<HelloWorld msg="Electron + Vite + Vue" />
	<div class="center-elements">
		Place static files into the <code>/public</code> folder
		<img style="width: 5em" src="/img/icons/icon-256x256.png" alt="Node logo" />
	</div>
</template>
