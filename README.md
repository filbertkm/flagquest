# FlagQuest

A geography quiz game built with Nuxt and Vue where you guess countries from their flags. Country data is fetched from Wikidata.

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
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run fix` - Auto-fix ESLint issues
- `npm run fetch-countries` - Update country data from Wikidata

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages.

### Initial Setup

1. Go to your repository settings on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Build and deployment**, select:
   - **Source**: GitHub Actions

### Automatic Deployment

Once configured, the site will automatically deploy when you push to the `main` branch. The GitHub Actions workflow will:

1. Install dependencies
2. Generate the static site
3. Deploy to GitHub Pages

The game will be available at: **https://filbertkm.github.io/wikidata-game/**

### Manual Deployment

You can also trigger a deployment manually:

1. Go to the **Actions** tab in your repository
2. Select the **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
