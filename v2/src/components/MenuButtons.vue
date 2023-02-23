<script setup lang="ts">
defineProps<{ isChatPage: boolean }>();
</script>

<template>
	<div id="menu-buttons">
		<button v-if="isChatPage" id="back" class="secondary">
			<img src="../assets/svg/back.svg" />
		</button>
		<button id="minimize" class="secondary">
			<img src="../assets/svg/minimize.svg" />
		</button>
		<button id="close">
			<img src="../assets/svg/close.svg" />
		</button>
	</div>
</template>
