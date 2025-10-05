<template>
	<div class="index-page">
		<div class="flag-background">
			<img
				v-for="flag in displayFlags"
				:key="flag.id"
				:src="flag.flag"
				:alt="flag.name"
				class="background-flag"
			>
		</div>
		<main class="container">
			<hgroup>
				<h1>FlagQuest</h1>
			</hgroup>
			<p>Test your geography knowledge with flags from around the world!</p>
			<NuxtLink
				to="/play"
				role="button"
			>Start Playing</NuxtLink>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { Country } from "~/types";

defineOptions({
	name: "IndexPage",
});

const countries = (await import("~/data/countries.json").then(
	m => m.default,
)) as Country[];

const displayFlags = computed(() => {
	const shuffled = [...countries].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, 20);
});

useSeoMeta({
	title: "FlagQuest - Guess the Country from Flags",
	description:
    "Test your geography knowledge with this flag guessing game using country flags from Wikidata",
});
</script>

<style scoped>
.index-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flag-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1rem;
  padding: 2rem;
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.background-flag {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  filter: blur(1px);
}

main {
  position: relative;
  z-index: 1;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
}

@media (prefers-color-scheme: dark) {
  main {
    background: rgba(0, 0, 0, 0.5);
  }
}

hgroup {
  margin-bottom: 2rem;
}
</style>
