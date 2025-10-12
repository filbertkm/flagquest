<template>
	<nav>
		<ul>
			<li>
				<strong><NuxtLink to="/">FlagQuest</NuxtLink></strong>
			</li>
			<li class="mode-select-wrapper">
				<select
					:value="mode"
					class="mode-select"
					@change="
						switchMode(
							($event.target as HTMLSelectElement).value as
								| 'countries'
								| 'states',
						)
					"
				>
					<option value="countries">
						World
					</option>
					<option value="states">
						US & Canada
					</option>
				</select>
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
			<li class="stat-item">
				<span class="stat-label">Accuracy: </span>{{ accuracy }}%
			</li>
			<li class="stat-item">
				<span class="stat-label">Round: </span>{{ round }}/{{ maxRounds }}
			</li>
			<li>
				<button
					class="secondary outline"
					@click="startOver"
				>
					<span class="btn-text-full">Start Over</span>
					<span class="btn-text-short">Restart</span>
				</button>
			</li>
		</ul>
	</nav>
</template>

<script setup lang="ts">
defineProps<{
	mode: "countries" | "states";
	accuracy: number;
	round: number;
	maxRounds: number;
}>();

const emit = defineEmits<{
	switchMode: [mode: "countries" | "states"];
	startOver: [];
}>();

function switchMode(newMode: "countries" | "states") {
	emit("switchMode", newMode);
}

function startOver() {
	emit("startOver");
}
</script>

<style scoped>
nav {
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  nav {
    font-size: 1rem;
  }
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

nav ul {
  gap: 0.5rem;
}

nav ul li {
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
</style>
