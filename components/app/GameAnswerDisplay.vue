<template>
	<div class="result">
		<h3 :class="isCorrect ? 'correct' : 'incorrect'">
			{{ isCorrect ? "Correct! ✓" : "Incorrect ✗" }}
		</h3>
		<p>
			The answer is:
			<strong><a
				:href="`https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/${country.id}`"
				target="_blank"
				rel="noopener"
			>{{ country.name }}</a></strong>
		</p>
		<p class="flag-source">
			<small>
				<a
					:href="getFlagCommonsUrl(country.flag)"
					target="_blank"
					rel="noopener"
				>Flag image source</a>
			</small>
		</p>
		<button
			ref="nextButtonRef"
			@click="$emit('nextRound')"
		>
			{{ isFinalRound ? "View Results" : "Next Flag" }}
		</button>
	</div>
</template>

<script setup lang="ts">
import type { Country } from "~/types";

defineProps<{
	country: Country;
	isCorrect: boolean;
	isFinalRound: boolean;
}>();

defineEmits<{
	nextRound: [];
}>();

const nextButtonRef = ref<HTMLButtonElement | null>(null);

const getFlagCommonsUrl = (flagUrl: string) => {
	const filename = flagUrl.split("/").pop();
	return `https://commons.wikimedia.org/wiki/File:${filename}`;
};

defineExpose({
	nextButtonRef,
});

onMounted(() => {
	nextTick(() => {
		nextButtonRef.value?.focus();
	});
});
</script>

<style scoped>
.result {
  margin-top: 2rem;
}

.flag-source {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.flag-source a {
  color: var(--pico-muted-color);
  text-decoration: none;
}

.flag-source a:hover {
  text-decoration: underline;
}

.correct {
  color: var(--pico-color-green-500, green);
}

.incorrect {
  color: var(--pico-color-red-500, red);
}
</style>
