<template>
	<article
		v-if="currentCountry"
		:class="{ 'keyboard-open': isKeyboardOpen }"
	>
		<h2 v-if="!isKeyboardOpen || showAnswer">
			Which flag is this?
		</h2>
		<div
			ref="flagContainerRef"
			class="flag-container"
		>
			<img
				:src="currentCountry.flag"
				:alt="`Flag of ${showAnswer ? currentCountry.name : '???'}`"
			>
		</div>

		<GameInput
			v-if="!showAnswer"
			ref="gameInputRef"
			:countries="countries"
			:placeholder="autocompletePlaceholderText"
			:keyboard-open="isKeyboardOpen"
			@submit="submitGuess"
			@skip="showCurrentAnswer"
			@focus="handleInputFocus"
		/>

		<div
			v-else
			class="result"
		>
			<h3 :class="isCorrect ? 'correct' : 'incorrect'">
				{{ isCorrect ? "Correct! ✓" : "Incorrect ✗" }}
			</h3>
			<p>
				The answer is:
				<strong><a
					:href="`https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/${currentCountry.id}`"
					target="_blank"
					rel="noopener"
				>{{ currentCountry.name }}</a></strong>
			</p>
			<p class="flag-source">
				<small>
					<a
						:href="getFlagCommonsUrl(currentCountry.flag)"
						target="_blank"
						rel="noopener"
					>Flag image source</a>
				</small>
			</p>
			<button
				ref="nextButtonRef"
				@click="nextRound"
			>
				{{ round >= maxRounds ? "View Results" : "Next Flag" }}
			</button>
		</div>
	</article>

	<GameResults
		v-else
		:accuracy="accuracy"
		:correct-answers="correctAnswers"
		:max-rounds="maxRounds"
		:game-history="gameHistory"
		@start-over="startOver"
	/>
</template>

<script setup lang="ts">
import type { Country, GameRound } from "~/types";
import GameResults from "~/components/app/GameResults.vue";
import GameInput from "~/components/app/GameInput.vue";

const props = defineProps<{
	countries: Country[];
	autocompletePlaceholderText: string;
	maxRounds: number;
}>();

const emit = defineEmits<{
	updateStats: [{ round: number; correctAnswers: number; accuracy: number }];
	gameOver: [];
}>();

const round = ref(1);
const correctAnswers = ref(0);
const currentCountry = ref<Country | null>(null);
const showAnswer = ref(false);
const isCorrect = ref(false);
const usedCountries = ref(new Set());
const nextButtonRef = ref<HTMLButtonElement | null>(null);
const flagContainerRef = ref<HTMLDivElement | null>(null);
const isKeyboardOpen = ref(false);

const gameHistory = ref<GameRound[]>([]);
const gameInputRef = ref<InstanceType<typeof GameInput> | null>(null);

const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

const getFlagCommonsUrl = (flagUrl: string) => {
	const filename = flagUrl.split("/").pop();
	return `https://commons.wikimedia.org/wiki/File:${filename}`;
};

const accuracy = computed(() => {
	if (round.value === 1 && !showAnswer.value) return 0;
	const answeredRounds = showAnswer.value ? round.value : round.value - 1;
	return answeredRounds > 0
		? Math.round((correctAnswers.value / answeredRounds) * 100)
		: 0;
});

function getRandomCountry(): Country | null {
	const available = props.countries.filter(
		c => !usedCountries.value.has(c.id),
	);
	if (available.length === 0) return null;
	const country = available[Math.floor(Math.random() * available.length)]!;
	usedCountries.value.add(country.id);
	return country;
}

function submitGuess(guess: string) {
	if (!guess || !currentCountry.value) return;

	const userGuess = normalizeString(guess);
	const correctName = normalizeString(currentCountry.value.name);
	const aliasMatch
		= currentCountry.value.aliases?.some(
			(alias: string) => normalizeString(alias) === userGuess,
		) || false;

	isCorrect.value = userGuess === correctName || aliasMatch;

	if (isCorrect.value) {
		correctAnswers.value++;
	}

	showAnswer.value = true;

	nextTick(() => {
		nextButtonRef.value?.focus();
	});
}

function showCurrentAnswer() {
	isCorrect.value = false;
	showAnswer.value = true;

	nextTick(() => {
		nextButtonRef.value?.focus();
	});
}

function nextRound() {
	if (currentCountry.value) {
		gameHistory.value.push({
			country: currentCountry.value,
			correct: isCorrect.value,
			userGuess: gameInputRef.value?.guess || "",
		});
	}

	emitStats();

	if (round.value >= props.maxRounds) {
		currentCountry.value = null;
		emit("gameOver");
		return;
	}

	round.value++;
	gameInputRef.value?.reset();
	showAnswer.value = false;
	isCorrect.value = false;
	currentCountry.value = getRandomCountry();

	nextTick(() => {
		gameInputRef.value?.focus();
	});
}

function handleInputFocus() {
	if (window.innerWidth < 576) {
		setTimeout(() => {
			flagContainerRef.value?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}, 300);
	}
}

function handleViewportResize() {
	if (window.innerWidth >= 576) {
		isKeyboardOpen.value = false;
		return;
	}

	if (window.visualViewport) {
		const viewportHeight = window.visualViewport.height;
		const windowHeight = window.innerHeight;
		isKeyboardOpen.value = viewportHeight < windowHeight * 0.75;
	}
}

function startOver() {
	round.value = 1;
	correctAnswers.value = 0;
	gameInputRef.value?.reset();
	showAnswer.value = false;
	isCorrect.value = false;
	usedCountries.value = new Set();
	gameHistory.value = [];
	currentCountry.value = getRandomCountry();

	emitStats();

	nextTick(() => {
		gameInputRef.value?.focus();
	});
}

function handleGlobalKeyDown(event: KeyboardEvent) {
	if (showAnswer.value && event.key === "ArrowRight") {
		event.preventDefault();
		nextRound();
	}
}

function emitStats() {
	emit("updateStats", {
		round: round.value,
		correctAnswers: correctAnswers.value,
		accuracy: accuracy.value,
	});
}

defineExpose({
	startOver,
});

watch(
	() => props.countries,
	() => {
		startOver();
	},
);

onMounted(() => {
	currentCountry.value = getRandomCountry();
	emitStats();
	nextTick(() => {
		gameInputRef.value?.focus();
	});
	window.addEventListener("keydown", handleGlobalKeyDown);

	if (window.visualViewport) {
		window.visualViewport.addEventListener("resize", handleViewportResize);
	}
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleGlobalKeyDown);

	if (window.visualViewport) {
		window.visualViewport.removeEventListener("resize", handleViewportResize);
	}
});
</script>

<style scoped>
article {
  text-align: center;
  max-width: 600px;
  width: 100%;
  padding: 0.5rem;
}

article h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

@media (min-width: 576px) {
  article {
    padding: 1rem;
  }

  article h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
}

.flag-container {
  margin: 1rem 0;
}

.flag-container img {
  max-width: 100%;
  height: auto;
  max-height: 180px;
  border: 2px solid var(--pico-muted-border-color);
  border-radius: var(--pico-border-radius);
}

article.keyboard-open .flag-container {
  margin: 0.5rem 0;
}

article.keyboard-open .flag-container img {
  max-height: 120px;
}

article.keyboard-open {
  padding: 0.25rem;
}

@media (min-width: 576px) {
  .flag-container {
    margin: 2rem 0;
  }

  .flag-container img {
    max-height: 300px;
  }

  article.keyboard-open .flag-container {
    margin: 2rem 0;
  }

  article.keyboard-open .flag-container img {
    max-height: 300px;
  }

  article.keyboard-open {
    padding: 1rem;
  }
}

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
