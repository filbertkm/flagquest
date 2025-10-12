<template>
	<div class="game-layout">
		<header class="container">
			<GameNavBar
				:mode="mode"
				:accuracy="accuracy"
				:round="round"
				:max-rounds="maxRounds"
				@switch-mode="switchMode"
				@start-over="startOver"
			/>
		</header>

		<main class="container">
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

				<div
					v-if="!showAnswer"
					class="input-section"
				>
					<div class="autocomplete-wrapper">
						<input
							ref="inputRef"
							v-model="guess"
							type="text"
							:placeholder="autocompletePlaceholderText"
							autocomplete="off"
							role="combobox"
							aria-autocomplete="list"
							:aria-expanded="showSuggestions && filteredCountries.length > 0"
							aria-controls="suggestions-list"
							@keydown="handleKeyDown"
							@keyup.enter="submitGuess"
							@input="
								showSuggestions = true;
								selectedIndex = -1;
							"
							@blur="hideSuggestions"
							@focus="handleInputFocus"
						>
						<ul
							v-if="showSuggestions && filteredCountries.length > 0"
							id="suggestions-list"
							class="suggestions"
							role="listbox"
						>
							<li
								v-for="(item, index) in filteredCountries.slice(0, 5)"
								:key="`${item.country.id}-${item.displayText}`"
								:class="{ selected: index === selectedIndex }"
								role="option"
								:aria-selected="index === selectedIndex"
								@mousedown.prevent="selectCountry(item.displayText)"
								@mouseenter="selectedIndex = index"
							>
								{{ item.displayText }}
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
							:disabled="!isValidGuess"
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
		</main>
	</div>
</template>

<script setup lang="ts">
import type { Country, GameRound, SuggestionItem } from "~/types";
import countriesData from "~/data/countries.json";
import statesData from "~/data/states.json";
import GameNavBar from "~/components/app/GameNavBar.vue";
import GameResults from "~/components/app/GameResults.vue";

defineOptions({
	name: "PlayPage",
});

const mode = ref<"countries" | "states">("countries");
const countries = computed<Country[]>(() =>
	mode.value === "countries" ? countriesData : statesData,
);
const autocompletePlaceholderText = computed(() => {
	return mode.value === "countries"
		? "Enter country or territory name..."
		: "Enter state or province name...";
});

const maxRounds = 10;
const round = ref(1);
const correctAnswers = ref(0);
const currentCountry = ref<Country | null>(null);
const guess = ref("");
const showAnswer = ref(false);
const isCorrect = ref(false);
const usedCountries = ref(new Set());
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const inputRef = ref<HTMLInputElement | null>(null);
const nextButtonRef = ref<HTMLButtonElement | null>(null);
const flagContainerRef = ref<HTMLDivElement | null>(null);
const isKeyboardOpen = ref(false);

const gameHistory = ref<GameRound[]>([]);

// normalize string for case-insensitive matching and diacritic marks
const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

// convert flag URL to Wikimedia Commons page
const getFlagCommonsUrl = (flagUrl: string) => {
	const filename = flagUrl.split("/").pop();
	return `https://commons.wikimedia.org/wiki/File:${filename}`;
};

const filteredCountries = computed(() => {
	if (!guess.value || guess.value.length < 1) return [];
	const searchTerm = normalizeString(guess.value);

	const startsWithMatches: SuggestionItem[] = [];
	const containsMatches: SuggestionItem[] = [];

	for (const c of countries.value) {
		const nameNormalized = normalizeString(c.name);
		const nameStartsWith = nameNormalized.startsWith(searchTerm);
		const nameContains = nameNormalized.includes(searchTerm);

		if (nameStartsWith) {
			startsWithMatches.push({ country: c, displayText: c.name });
		}
		else if (nameContains) {
			containsMatches.push({ country: c, displayText: c.name });
		}

		if (c.aliases) {
			for (const alias of c.aliases) {
				const aliasNormalized = normalizeString(alias);
				if (aliasNormalized.startsWith(searchTerm)) {
					startsWithMatches.push({ country: c, displayText: alias });
				}
				else if (aliasNormalized.includes(searchTerm)) {
					containsMatches.push({ country: c, displayText: alias });
				}
			}
		}
	}

	return [...startsWithMatches, ...containsMatches];
});

const accuracy = computed(() => {
	if (round.value === 1 && !showAnswer.value) return 0;
	const answeredRounds = showAnswer.value ? round.value : round.value - 1;
	return answeredRounds > 0
		? Math.round((correctAnswers.value / answeredRounds) * 100)
		: 0;
});

const isValidGuess = computed(() => {
	if (!guess.value.trim()) return false;
	const normalizedGuess = normalizeString(guess.value.trim());
	return countries.value.some((c) => {
		if (normalizeString(c.name) === normalizedGuess) return true;
		return c.aliases?.some(
			(alias: string) => normalizeString(alias) === normalizedGuess,
		);
	});
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
	if (!guess.value.trim() || !currentCountry.value || !isValidGuess.value)
		return;

	const userGuess = normalizeString(guess.value.trim());
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
			userGuess: guess.value.trim(),
		});
	}

	if (round.value >= maxRounds) {
		currentCountry.value = null;
		return;
	}

	round.value++;
	guess.value = "";
	showAnswer.value = false;
	isCorrect.value = false;
	currentCountry.value = getRandomCountry();

	nextTick(() => {
		inputRef.value?.focus();
	});
}

function selectCountry(name: string) {
	guess.value = name;
	showSuggestions.value = false;
	selectedIndex.value = -1;
}

function hideSuggestions() {
	setTimeout(() => {
		showSuggestions.value = false;
		selectedIndex.value = -1;
	}, 200);
}

function handleInputFocus() {
	showSuggestions.value = true;

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

function handleKeyDown(event: KeyboardEvent) {
	if (!showSuggestions.value || filteredCountries.value.length === 0) {
		return;
	}

	const maxIndex = Math.min(filteredCountries.value.length, 5) - 1;

	switch (event.key) {
		case "ArrowDown":
			event.preventDefault();
			selectedIndex.value
				= selectedIndex.value < maxIndex ? selectedIndex.value + 1 : 0;
			break;
		case "ArrowUp":
			event.preventDefault();
			selectedIndex.value
				= selectedIndex.value > 0 ? selectedIndex.value - 1 : maxIndex;
			break;
		case "Enter":
		case "Tab":
			if (selectedIndex.value >= 0 && selectedIndex.value <= maxIndex) {
				event.preventDefault();
				const selectedItem = filteredCountries.value[selectedIndex.value];
				if (selectedItem) {
					selectCountry(selectedItem.displayText);
				}
			}
			break;
		case "Escape":
			event.preventDefault();
			showSuggestions.value = false;
			selectedIndex.value = -1;
			break;
	}
}

function startOver() {
	round.value = 1;
	correctAnswers.value = 0;
	guess.value = "";
	showAnswer.value = false;
	isCorrect.value = false;
	usedCountries.value = new Set();
	showSuggestions.value = false;
	selectedIndex.value = -1;
	gameHistory.value = [];
	currentCountry.value = getRandomCountry();

	nextTick(() => {
		inputRef.value?.focus();
	});
}

function handleGlobalKeyDown(event: KeyboardEvent) {
	if (showAnswer.value && event.key === "ArrowRight") {
		event.preventDefault();
		nextRound();
	}
}

onMounted(() => {
	currentCountry.value = getRandomCountry();
	nextTick(() => {
		inputRef.value?.focus();
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
.game-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
}

header {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

@media (min-width: 576px) {
  header {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
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
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  margin: 0;
  white-space: nowrap;
}

@media (min-width: 768px) {
  nav button {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
}

header nav {
  font-size: 0.875rem;
}

header nav ul {
  gap: 0.5rem;
}

header nav ul li {
  padding: 0;
}

.stat-label {
  display: none;
}

.btn-text-short {
  display: inline;
}

.btn-text-full {
  display: none;
}

@media (min-width: 576px) {
  .stat-label {
    display: inline;
  }

  .btn-text-short {
    display: none;
  }

  .btn-text-full {
    display: inline;
  }
}

.mode-select-wrapper {
  display: flex;
  align-items: center;
}

.mode-label {
  font-size: 0.75rem;
  margin: 0;
  white-space: nowrap;
  color: var(--pico-muted-color);
}

.mode-select {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  margin: 0;
  min-width: auto;
  width: auto;
  font-weight: 600;
  border: 2px solid var(--pico-primary);
  background-color: var(--pico-primary-focus);
}

.mode-tabs {
  display: none;
  gap: 0.35rem;
  margin-left: 0.5rem;
}

.mode-tabs button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: transparent;
  border: 1px solid var(--pico-border-color);
  color: var(--pico-color);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.mode-tabs button:hover {
  background: var(--pico-primary-focus);
}

.mode-tabs button.active {
  background: var(--pico-primary);
  border-color: var(--pico-primary);
  color: var(--pico-primary-inverse);
}

@media (min-width: 768px) {
  header nav {
    font-size: 1rem;
  }

  .mode-select-wrapper {
    display: none;
  }

  .mode-tabs {
    display: flex;
    gap: 0.5rem;
    margin-left: 1rem;
  }

  .mode-tabs button {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
}

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

article.keyboard-open .autocomplete-wrapper {
  margin-bottom: 0.5rem;
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

article.keyboard-open .suggestions {
  max-height: 150px;
}

article.keyboard-open .suggestions li {
  padding: 0.5rem 1rem;
}

.suggestions li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  text-align: left;
}

.suggestions li:hover,
.suggestions li.selected {
  background-color: var(--pico-primary-focus);
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
