<template>
	<footer class="container">
		<p>
			<small>
				Data from
				<a
					href="https://www.wikidata.org"
					target="_blank"
					rel="noopener"
				>Wikidata</a>
				• Flags from
				<a
					href="https://commons.wikimedia.org"
					target="_blank"
					rel="noopener"
				>Wikimedia Commons</a>
				•
				<a
					href="https://github.com/filbertkm/flagquest"
					target="_blank"
					rel="noopener"
				>Source Code</a>
			</small>
		</p>
	</footer>
</template>

<script setup>
defineOptions({
	name: "AppFooter",
});
</script>

<style scoped>
footer {
  text-align: center;
  padding: 1rem 0;
}

footer a {
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}
</style>
