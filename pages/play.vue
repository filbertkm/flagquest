<template>
	<div class="game-layout">
		<header class="container">
			<nav>
				<ul>
					<li>
						<strong><NuxtLink to="/">FlagQuest</NuxtLink></strong>
					</li>
					<li class="mode-tabs">
						<button
							:class="{ active: mode === 'countries' }"
							@click="switchMode('countries')"
						>
							World
						</button>
						<button
							:class="{ active: mode === 'states' }"
							@click="switchMode('states')"
						>
							US & Canada
						</button>
					</li>
				</ul>
				<ul>
					<li>Accuracy: {{ accuracy }}%</li>
					<li>Round: {{ round }}/{{ maxRounds }}</li>
					<li>
						<button
							class="secondary outline"
							@click="startOver"
						>
							Start Over
						</button>
					</li>
				</ul>
			</nav>
		</header>

		<main class="container">
			<article v-if="currentCountry">
				<h2>Which flag is this?</h2>
				<div class="flag-container">
					<img
						:src="currentCountry.flag"
						:alt="`Flag of ${showAnswer ? currentCountry.name : '???'}`"
					>
				</div>

				<div
					v-if="!showAnswer"
					class="input-section"
				>
					<div class="autocomplete-wrapper">
						<input
							v-model="guess"
							type="text"
							placeholder="Enter country or territory name..."
							autocomplete="off"
							@keyup.enter="submitGuess"
							@input="showSuggestions = true"
							@blur="hideSuggestions"
							@focus="showSuggestions = true"
						>
						<ul
							v-if="showSuggestions && filteredCountries.length > 0"
							class="suggestions"
						>
							<li
								v-for="country in filteredCountries.slice(0, 5)"
								:key="country.id"
								@mousedown.prevent="selectCountry(country.name)"
							>
								{{ country.name }}
							</li>
						</ul>
					</div>
					<div class="button-container">
						<button
							class="secondary"
							@click="showCurrentAnswer"
						>
							Skip
						</button>
						<button
							:disabled="!guess.trim()"
							@click="submitGuess"
						>
							Submit
						</button>
					</div>
				</div>

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
					<button @click="nextRound">
						{{ round >= maxRounds ? "View Results" : "Next Flag" }}
					</button>
				</div>
			</article>

			<article
				v-else
				class="results"
			>
				<h2>Game Over!</h2>
				<p>Final Accuracy: {{ accuracy }}%</p>
				<p>Correct answers: {{ correctAnswers }} / {{ maxRounds }}</p>
				<NuxtLink
					to="/"
					role="button"
				>Play Again</NuxtLink>
			</article>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { Country } from "~/types";

defineOptions({
	name: "PlayPage",
});

const countriesData = await import("~/data/countries.json").then(
	m => m.default,
);
const statesData = await import("~/data/states.json").then(m => m.default);

const mode = ref<"countries" | "states">("countries");
const countries = computed(() =>
	mode.value === "countries" ? countriesData : statesData,
);

const maxRounds = 10;
const round = ref(1);
const correctAnswers = ref(0);
const currentCountry = ref<Country | null>(null);
const guess = ref("");
const showAnswer = ref(false);
const isCorrect = ref(false);
const usedCountries = ref(new Set());
const showSuggestions = ref(false);

// normalize string for case-insensitive matching and diacritic marks
const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

const filteredCountries = computed(() => {
	if (!guess.value || guess.value.length < 1) return [];
	const searchTerm = normalizeString(guess.value);

	// Prioritize prefix matches, then include contains matches
	const startsWithMatches = countries.value.filter(c =>
		normalizeString(c.name).startsWith(searchTerm),
	);
	const containsMatches = countries.value.filter(
		c =>
			!normalizeString(c.name).startsWith(searchTerm)
			&& normalizeString(c.name).includes(searchTerm),
	);

	return [...startsWithMatches, ...containsMatches];
});

const accuracy = computed(() => {
	if (round.value === 1 && !showAnswer.value) return 0;
	const answeredRounds = showAnswer.value ? round.value : round.value - 1;
	return answeredRounds > 0
		? Math.round((correctAnswers.value / answeredRounds) * 100)
		: 0;
});

function getRandomCountry(): Country | null {
	const available = countries.value.filter(
		c => !usedCountries.value.has(c.id),
	);
	if (available.length === 0) return null;
	const country = available[Math.floor(Math.random() * available.length)]!;
	usedCountries.value.add(country.id);
	return country;
}

function switchMode(newMode: "countries" | "states") {
	mode.value = newMode;
	startOver();
}

function submitGuess() {
	if (!guess.value.trim() || !currentCountry.value) return;

	const userGuess = normalizeString(guess.value.trim());
	const correctName = normalizeString(currentCountry.value.name);

	isCorrect.value = userGuess === correctName;

	if (isCorrect.value) {
		correctAnswers.value++;
	}

	showAnswer.value = true;
}

function showCurrentAnswer() {
	isCorrect.value = false;
	showAnswer.value = true;
}

function nextRound() {
	if (round.value >= maxRounds) {
		currentCountry.value = null;
		return;
	}

	round.value++;
	guess.value = "";
	showAnswer.value = false;
	isCorrect.value = false;
	currentCountry.value = getRandomCountry();
}

function selectCountry(name: string) {
	guess.value = name;
	showSuggestions.value = false;
}

function hideSuggestions() {
	setTimeout(() => {
		showSuggestions.value = false;
	}, 200);
}

function startOver() {
	round.value = 1;
	correctAnswers.value = 0;
	guess.value = "";
	showAnswer.value = false;
	isCorrect.value = false;
	usedCountries.value = new Set();
	showSuggestions.value = false;
	currentCountry.value = getRandomCountry();
}

onMounted(() => {
	currentCountry.value = getRandomCountry();
});
</script>

<style scoped>
.game-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

nav a {
  text-decoration: none;
  transition: opacity 0.2s ease;
}

nav a:hover {
  text-decoration: none;
  opacity: 0.7;
}

nav button {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  margin: 0;
}

.mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.mode-tabs button {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background: transparent;
  border: 1px solid var(--pico-border-color);
  color: var(--pico-color);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tabs button:hover {
  background: var(--pico-primary-focus);
}

.mode-tabs button.active {
  background: var(--pico-primary);
  border-color: var(--pico-primary);
  color: var(--pico-primary-inverse);
}

article {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.input-section {
  width: 100%;
}

.button-container {
  display: flex;
  gap: 1rem;
}

.button-container button {
  flex: 1;
}

.autocomplete-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.autocomplete-wrapper input {
  width: 100%;
  margin-bottom: 0;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--pico-background-color);
  border: 1px solid var(--pico-muted-border-color);
  border-top: none;
  border-radius: 0 0 var(--pico-border-radius) var(--pico-border-radius);
  max-height: 200px;
  overflow-y: auto;
}

.suggestions li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  text-align: left;
}

.suggestions li:hover {
  background-color: var(--pico-primary-focus);
}

.flag-container {
  margin: 2rem 0;
}

.flag-container img {
  max-width: 100%;
  height: auto;
  max-height: 300px;
  border: 2px solid var(--pico-muted-border-color);
  border-radius: var(--pico-border-radius);
}

.result {
  margin-top: 2rem;
}

.correct {
  color: var(--pico-color-green-500, green);
}

.incorrect {
  color: var(--pico-color-red-500, red);
}

.results {
  text-align: center;
}
</style>
