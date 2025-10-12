<template>
	<article
		v-if="!isGameOver"
		:class="{ 'keyboard-open': isKeyboardOpen }"
	>
		<h2 v-if="shouldShowHeader">
			Which flag is this?
		</h2>
		<div
			ref="flagContainerRef"
			class="flag-container"
		>
			<img
				:src="currentCountry!.flag"
				:alt="flagAltText"
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

		<GameAnswerDisplay
			v-else
			ref="answerDisplayRef"
			:country="currentCountry!"
			:is-correct="isCorrect"
			:is-final-round="isFinalRound"
			@next-round="nextRound"
		/>
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
import GameAnswerDisplay from "./GameAnswerDisplay.vue";
import { isMobileWidth } from "~/constants/breakpoints";

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
const currentGuess = ref("");
const showAnswer = ref(false);
const isCorrect = ref(false);
const usedCountries = ref(new Set());
const flagContainerRef = ref<HTMLDivElement | null>(null);
const isKeyboardOpen = ref(false);

const gameHistory = ref<GameRound[]>([]);
const gameInputRef = ref<InstanceType<typeof GameInput> | null>(null);
const answerDisplayRef = ref<InstanceType<typeof GameAnswerDisplay> | null>(
	null,
);

const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

const accuracy = computed(() => {
	if (round.value === 1 && !showAnswer.value) return 0;
	const answeredRounds = showAnswer.value ? round.value : round.value - 1;
	return answeredRounds > 0
		? Math.round((correctAnswers.value / answeredRounds) * 100)
		: 0;
});

const isFinalRound = computed(() => round.value >= props.maxRounds);

const isGameOver = computed(() => currentCountry.value === null);

const shouldShowHeader = computed(
	() => !isKeyboardOpen.value || showAnswer.value,
);

const flagAltText = computed(() =>
	showAnswer.value && currentCountry.value
		? `Flag of ${currentCountry.value.name}`
		: "Flag of ???",
);

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

	currentGuess.value = guess;
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
}

function showCurrentAnswer() {
	currentGuess.value = "";
	isCorrect.value = false;
	showAnswer.value = true;
}

function nextRound() {
	if (currentCountry.value) {
		gameHistory.value.push({
			country: currentCountry.value,
			correct: isCorrect.value,
			userGuess: currentGuess.value,
		});
	}

	emitStats();

	if (isFinalRound.value) {
		currentCountry.value = null;
		emit("gameOver");
		return;
	}

	round.value++;
	currentGuess.value = "";
	gameInputRef.value?.reset();
	showAnswer.value = false;
	isCorrect.value = false;
	currentCountry.value = getRandomCountry();

	nextTick(() => {
		if (isMobileWidth()) {
			setTimeout(() => {
				gameInputRef.value?.focus();
			}, 100);
		}
		else {
			gameInputRef.value?.focus();
		}
	});
}

function handleInputFocus() {
	if (isMobileWidth()) {
		setTimeout(() => {
			flagContainerRef.value?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}, 300);
	}
}

function handleViewportResize() {
	if (!isMobileWidth()) {
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
	currentGuess.value = "";
	gameInputRef.value?.reset();
	showAnswer.value = false;
	isCorrect.value = false;
	usedCountries.value = new Set();
	gameHistory.value = [];
	currentCountry.value = getRandomCountry();

	emitStats();

	nextTick(() => {
		nextTick(() => {
			if (window.innerWidth < 576) {
				setTimeout(() => {
					gameInputRef.value?.focus();
				}, 100);
			}
			else {
				gameInputRef.value?.focus();
			}
		});
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
		nextTick(() => {
			if (isMobileWidth()) {
				setTimeout(() => {
					gameInputRef.value?.focus();
				}, 100);
			}
			else {
				gameInputRef.value?.focus();
			}
		});
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
  article {
    padding: 1rem;
  }

  article h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

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
</style>
