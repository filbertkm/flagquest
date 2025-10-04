<template>
	<main class="container">
		<hgroup>
			<h1>WikiGame</h1>
			<p>Guess the country from its flag</p>
		</hgroup>
		<p>Test your geography knowledge with flags from around the world</p>
		<NuxtLink
			to="/play"
			role="button"
		>Start Playing</NuxtLink>
	</main>
</template>

<script setup lang="ts">
defineOptions({
	name: "IndexPage",
});

useSeoMeta({
	title: "WikiGame - Guess the Location",
	description: "A location guessing game using Wikimedia Commons images",
});
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}

hgroup {
  margin-bottom: 2rem;
}
</style>
