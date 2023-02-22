<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import MenuButtons from './components/MenuButtons.vue';

postMessage({ payload: 'removeLoading' }, '*');

// const version = process.;

// console.log('[App.vue]', `Hello world from Electron ${process.versions.electron}!`);
</script>

<template>
	<header>
		<div id="app-info">Here comes the version</div>
		<MenuButtons />
	</header>
	<main class="container-fluid">
		<HelloWorld msg="Electron + Vite + Vue" />
		<div class="center-elements">
			Place static files into the <code>/public</code> folder
			<img style="width: 5em" src="/img/icons/icon-256x256.png" alt="Node logo" />
		</div>
	</main>
</template>
