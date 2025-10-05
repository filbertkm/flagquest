import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sparqlQuery = `
SELECT DISTINCT ?country ?countryLabel ?flag WHERE {
  ?country wdt:P41 ?flag.
  {
    ?country wdt:P31 wd:Q6256.
  }
  UNION
  {
    ?country wdt:P31 wd:Q3624078.
  }
  FILTER NOT EXISTS { ?country wdt:P31 wd:Q3024240. }
  FILTER NOT EXISTS { ?country wdt:P31 wd:Q15634554. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?countryLabel
`;

async function fetchCountries() {
	const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
		sparqlQuery,
	)}&format=json`;

	console.log("Fetching countries from Wikidata...");

	const response = await fetch(url, {
		headers: {
			"User-Agent": "FlagQuest/1.0",
			"Accept": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.statusText}`);
	}

	const data = await response.json();

	const rawCountries = data.results.bindings.map(item => ({
		id: item.country.value.split("/").pop(),
		name: item.countryLabel.value,
		flag: item.flag.value,
	}));

	const excludedCountries = ["Kingdom of Denmark"];

	const countryMap = new Map();
	for (const country of rawCountries) {
		if (excludedCountries.includes(country.name)) continue;

		const existing = countryMap.get(country.id);
		const currentHasUNFlag
			= country.flag.includes("United_Nations") || country.flag.includes("UNMIK");
		const existingHasUNFlag
			= existing?.flag.includes("United_Nations")
				|| existing?.flag.includes("UNMIK");

		const currentHasOwnFlag = country.flag
			.toLowerCase()
			.includes(country.name.toLowerCase().replace(/\s+/g, "_"));
		const existingHasOwnFlag = existing?.flag
			.toLowerCase()
			.includes(existing.name.toLowerCase().replace(/\s+/g, "_"));

		if (!existing) {
			countryMap.set(country.id, country);
		}
		else if (currentHasOwnFlag && !existingHasOwnFlag) {
			countryMap.set(country.id, country);
		}
		else if (!currentHasUNFlag && existingHasUNFlag) {
			countryMap.set(country.id, country);
		}
	}

	// Use more common names for certain countries
	const nameMapping = {
		"State of Palestine": "Palestine",
		"People's Republic of China": "China",
		"Republic of Korea": "South Korea",
		"Democratic People's Republic of Korea": "North Korea",
	};

	const countries = Array.from(countryMap.values())
		.map(country => ({
			...country,
			name: nameMapping[country.name] || country.name,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	console.log(`Found ${countries.length} unique countries`);

	const outputPath = join(__dirname, "../data/countries.json");
	await writeFile(outputPath, JSON.stringify(countries, null, 2));

	console.log(`Saved to ${outputPath}`);
}

fetchCountries().catch(console.error);
