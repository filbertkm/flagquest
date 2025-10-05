import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sparqlQuery = `
SELECT DISTINCT ?state ?stateLabel ?flag WHERE {
  ?state wdt:P41 ?flag.
  {
    ?state wdt:P31 wd:Q35657.
  }
  UNION
  {
    ?state wdt:P31 wd:Q783733.
  }
  UNION
  {
    ?state wdt:P31 wd:Q1352230.
  }
  UNION
  {
    ?state wdt:P31 wd:Q11828004.
  }
  UNION
  {
    ?state wdt:P31 wd:Q14784.
  }
  FILTER NOT EXISTS { ?state wdt:P582 ?endDate. }
  FILTER NOT EXISTS { ?state wdt:P576 ?dissolvedDate. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?stateLabel
`;

async function fetchStates() {
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
    sparqlQuery
  )}&format=json`;

  console.log(
    "Fetching US states, territories, and Canadian provinces from Wikidata..."
  );

  const response = await fetch(url, {
    headers: {
      "User-Agent": "FlagQuest/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data = await response.json();

  const rawStates = data.results.bindings.map((item) => ({
    id: item.state.value.split("/").pop(),
    name: item.stateLabel.value,
    flag: item.flag.value,
  }));

  const stateMap = new Map();
  for (const state of rawStates) {
    const existing = stateMap.get(state.id);
    const usesUSFlag = state.flag.includes("Flag%20of%20the%20United%20States");
    if (!existing && !usesUSFlag) {
      stateMap.set(state.id, state);
    }
  }

  const states = Array.from(stateMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  console.log(`Found ${states.length} unique states/provinces/territories`);

  const outputPath = join(__dirname, "../data/states.json");
  await writeFile(outputPath, JSON.stringify(states, null, 2));

  console.log(`Saved to ${outputPath}`);
}

fetchStates().catch(console.error);
