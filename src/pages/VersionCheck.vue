<template>
	<div id="version-check">
		<div>
			<div class="spinner">
				<div class="lds-roller">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
			<div>{{ loadingMessages[Math.floor(Math.random() * loadingMessages.length)] }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const loadingMessages = ['Loading hot chat actions', 'Crunching latest numbers', 'Preparing new followers'];

const emit = defineEmits(['removeLoading']);

setTimeout(() => {
	emit('removeLoading');
}, 2000);
</script>
