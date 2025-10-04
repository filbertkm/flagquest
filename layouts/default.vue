<template>
	<div>
		<slot />
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
			content: "light dark",
		},
	],
});
</script>
