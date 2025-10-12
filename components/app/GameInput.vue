<template>
	<div class="input-section">
		<div class="autocomplete-wrapper">
			<input
				ref="inputRef"
				v-model="guess"
				type="text"
				:placeholder="placeholder"
				autocomplete="off"
				role="combobox"
				aria-autocomplete="list"
				:aria-expanded="showSuggestions && filteredCountries.length > 0"
				aria-controls="suggestions-list"
				@keydown="handleKeyDown"
				@keyup.enter="handleSubmit"
				@input="handleInput"
				@blur="hideSuggestions"
				@focus="handleFocus"
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
				@click="$emit('skip')"
			>
				Skip
			</button>
			<button
				:disabled="!isValidGuess"
				@click="handleSubmit"
			>
				Submit
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Country, SuggestionItem } from "~/types";

const props = defineProps<{
	countries: Country[];
	placeholder: string;
	keyboardOpen?: boolean;
}>();

const emit = defineEmits<{
	submit: [guess: string];
	skip: [];
	focus: [];
}>();

const guess = ref("");
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const inputRef = ref<HTMLInputElement | null>(null);

const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

const filteredCountries = computed(() => {
	if (!guess.value || guess.value.length < 1) return [];
	const searchTerm = normalizeString(guess.value);

	const startsWithMatches: SuggestionItem[] = [];
	const containsMatches: SuggestionItem[] = [];

	for (const c of props.countries) {
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

const isValidGuess = computed(() => {
	if (!guess.value.trim()) return false;
	const normalizedGuess = normalizeString(guess.value.trim());
	return props.countries.some((c) => {
		if (normalizeString(c.name) === normalizedGuess) return true;
		return c.aliases?.some(
			(alias: string) => normalizeString(alias) === normalizedGuess,
		);
	});
});

function handleSubmit() {
	if (!guess.value.trim() || !isValidGuess.value) return;
	emit("submit", guess.value.trim());
}

function handleInput() {
	showSuggestions.value = true;
	selectedIndex.value = -1;
}

function handleFocus() {
	showSuggestions.value = true;
	emit("focus");
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

function reset() {
	guess.value = "";
	showSuggestions.value = false;
	selectedIndex.value = -1;
}

function focus() {
	nextTick(() => {
		inputRef.value?.focus();
	});
}

defineExpose({
	reset,
	focus,
	guess,
});
</script>

<style scoped>
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

.suggestions li:hover,
.suggestions li.selected {
  background-color: var(--pico-primary-focus);
}
</style>
