<template>
	<main class="container">
		<hgroup>
			<h1>FlagQuest</h1>
			<p>Guess the country from its flag</p>
		</hgroup>
		<p>Test your geography knowledge with flags from around the world!</p>
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
	title: "FlagQuest - Guess the Country from Flags",
	description:
    "Test your geography knowledge with this flag guessing game using country flags from Wikidata",
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
