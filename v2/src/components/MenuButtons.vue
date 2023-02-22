<script setup lang="ts">
import { ref } from 'vue';

const isChatPage = ref(true);
</script>

<template>
	<div v-if="isChatPage" id="menu-buttons">
		<button class="secondary">
			<img id="back" src="../assets/svg/back.svg" />
		</button>
		<button class="secondary">
			<img id="back" src="../assets/svg/minimize.svg" />
		</button>
		<button class="secondary">
			<img id="back" src="../assets/svg/close.svg" />
		</button>
	</div>
</template>
