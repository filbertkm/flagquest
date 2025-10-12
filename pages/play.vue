<template>
	<div class="game-layout">
		<header class="container">
			<GameNavBar
				:mode="mode"
				:accuracy="accuracy"
				:round="round"
				:max-rounds="maxRounds"
				@switch-mode="switchMode"
				@start-over="handleStartOver"
			/>
		</header>

		<main class="container">
			<Game
				ref="gameRef"
				:countries="countries"
				:autocomplete-placeholder-text="autocompletePlaceholderText"
				:max-rounds="maxRounds"
				@update-stats="handleUpdateStats"
			/>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { Country } from "~/types";
import countriesData from "~/data/countries.json";
import statesData from "~/data/states.json";
import GameNavBar from "~/components/app/GameNavBar.vue";
import Game from "~/components/app/Game.vue";

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
const accuracy = ref(0);

const gameRef = ref<InstanceType<typeof Game> | null>(null);

function switchMode(newMode: "countries" | "states") {
	mode.value = newMode;
}

function handleUpdateStats(stats: {
	round: number;
	correctAnswers: number;
	accuracy: number;
}) {
	round.value = stats.round;
	correctAnswers.value = stats.correctAnswers;
	accuracy.value = stats.accuracy;
}

function handleStartOver() {
	gameRef.value?.startOver();
}
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
</style>
