<template>
	<article class="results">
		<h2>Game Over!</h2>
		<p>Final Accuracy: {{ accuracy }}%</p>
		<p>Correct answers: {{ correctAnswers }} / {{ maxRounds }}</p>

		<GameSummary :game-history="gameHistory" />

		<button
			ref="playAgainRef"
			@click="startOver"
		>
			Play Again
		</button>
	</article>
</template>

<script setup lang="ts">
import type { GameRound } from "~/types";
import GameSummary from "~/components/app/GameSummary.vue";

defineProps<{
	accuracy: number;
	correctAnswers: number;
	maxRounds: number;
	gameHistory: GameRound[];
}>();

const emit = defineEmits<{
	startOver: [];
}>();

const playAgainRef = ref<HTMLButtonElement | null>(null);

defineExpose({
	playAgainRef,
});

function startOver() {
	emit("startOver");
}

onMounted(() => {
	nextTick(() => {
		playAgainRef.value?.focus();
	});
});
</script>

<style scoped>
.results {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.results h2 {
  margin-bottom: 0.5rem;
}

.results p {
  margin-bottom: 0.5rem;
}
</style>
