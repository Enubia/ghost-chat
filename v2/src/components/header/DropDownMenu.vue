<script setup lang="ts">
const props = defineProps<{ isChatPage: boolean; isMainPage: boolean }>();

const emit = defineEmits(['showSettings', 'showChat', 'showMain', 'vanish']);

const toggleTheme = () => {
	const $html = document.querySelector('html');
	const theme = $html?.getAttribute('data-theme');

	if (theme && theme === 'dark') {
		$html?.setAttribute('data-theme', 'light');
	} else {
		$html?.setAttribute('data-theme', 'dark');
	}
};
</script>

<template>
	<details id="app-info" role="list">
		<summary id="menu" aria-haspopup="listbox" role="button" class="secondary">
			<span><font-awesome-icon icon="fa-solid fa-bars" /></span>
		</summary>
		<ul role="listbox">
			<li v-if="!isMainPage"><a @click="emit('showMain')">Main</a></li>
			<li v-if="!props.isChatPage"><a @click="emit('showChat')">Chat</a></li>
			<li><a @click="emit('showSettings')">Settings</a></li>
			<li><a @click="toggleTheme">Toggle Color Theme</a></li>
			<!-- this is not working right now because of app.relaunch() app.exit() not relaunching properly -->
			<!-- <li v-if="isChatPage" id="vanish">
				<a @click="emit('vanish')">
					<font-awesome-icon icon="fa-solid fa-ghost" />
					<span>Vanish</span>
				</a>
				<span data-tooltip="transparent and click-through" data-placement="bottom">?</span>
			</li> -->
		</ul>
	</details>
</template>
