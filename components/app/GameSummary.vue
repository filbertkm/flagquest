<template>
	<div class="game-summary">
		<h3>Game Summary</h3>
		<div class="summary-grid">
			<div
				v-for="(result, index) in gameHistory"
				:key="index"
				:class="['summary-item', result.correct ? 'correct' : 'incorrect']"
			>
				<div class="summary-flag">
					<a
						:href="getFlagCommonsUrl(result.country.flag)"
						target="_blank"
						rel="noopener"
						:title="`View flag image source for ${result.country.name}`"
					>
						<img
							:src="result.country.flag"
							:alt="result.country.name"
						>
					</a>
				</div>
				<div class="summary-details">
					<div class="summary-name">
						{{ result.country.name }}
					</div>
					<div class="summary-result">
						<span
							v-if="result.correct"
							class="result-icon"
						>✓</span>
						<span
							v-else
							class="result-icon"
						>✗</span>
						<span
							v-if="!result.correct && result.userGuess"
							class="user-guess"
						>{{ result.userGuess }}</span>
						<span
							v-else-if="!result.correct"
							class="user-guess"
						>Skipped</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { GameRound } from "~/types";

defineProps<{
	gameHistory: GameRound[];
}>();

const getFlagCommonsUrl = (flagUrl: string) => {
	const filename = flagUrl.split("/").pop();
	return `https://commons.wikimedia.org/wiki/File:${filename}`;
};
</script>

<style scoped>
.game-summary {
  margin: 1.5rem 0;
  text-align: left;
}

.game-summary h3 {
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1.25rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 576px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-item:last-child:nth-child(3n + 1) {
    grid-column: 2;
  }
}

@media (min-width: 1024px) {
  .summary-grid {
    gap: 1rem;
  }
}

.summary-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--pico-border-radius);
  border: 2px solid transparent;
  background: var(--pico-card-background-color);
  min-width: 0;
  width: 100%;
}

.summary-item.correct {
  border-color: var(--pico-color-green-500, #4caf50);
}

.summary-item.incorrect {
  border-color: var(--pico-color-red-500, #f44336);
}

.summary-flag {
  flex-shrink: 0;
  width: 70px;
  height: 50px;
}

.summary-flag a {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
}

.summary-flag img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--pico-muted-border-color);
  transition: opacity 0.2s;
}

.summary-flag a:hover img {
  opacity: 0.8;
}

.summary-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.summary-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.2;
}

.summary-result {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.result-icon {
  font-size: 1rem;
  line-height: 1;
}

.summary-item.correct .result-icon {
  color: var(--pico-color-green-500, #4caf50);
}

.summary-item.incorrect .result-icon {
  color: var(--pico-color-red-500, #f44336);
}

.user-guess {
  color: var(--pico-muted-color);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
