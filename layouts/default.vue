<template>
	<div
		data-theme="dark"
		class="layout-wrapper"
	>
		<div class="content">
			<slot />
		</div>
		<AppFooter />
	</div>
</template>

<script setup>
defineOptions({
	name: "DefaultLayout",
});

useHead({
	link: [
		{
			rel: "stylesheet",
			href: "https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css",
		},
	],
	meta: [
		{
			name: "color-scheme",
			content: "dark",
		},
	],
});
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
