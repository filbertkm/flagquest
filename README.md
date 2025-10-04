# WikiGame - Flag Guessing Game

A geography quiz game built with Nuxt and Vue where you guess countries from their flags. Country data is fetched from Wikidata and features an intelligent autocomplete system.

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Fetching Country Data

The game uses cached country data from Wikidata. To update the country list:

```bash
npm run fetch-countries
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run fix` - Auto-fix ESLint issues
- `npm run fetch-countries` - Update country data from Wikidata