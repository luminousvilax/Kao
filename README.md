# MapleStory Hexa Tracker

A browser-based tracker for MapleStory's 6th Job (Hexa) progression.

## Features

- **Browser Persistence**: Your data is saved automatically to your local browser storage.
- **Resource Tracking**: Track Sol Erda and Fragments.
- **Character Info**: Basic character level and name tracking.

## Dev Status

Useful sequence data is not ready yet.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to the local URL (usually `http://localhost:5173`).

### Building for Production

To build the static files for deployment:

```bash
npm run build
```

The output will be in the `dist/` directory.

## Deployment

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions.

1. Go to your repository **Settings**.
2. Navigate to **Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Push your changes to the `main` branch.
5. The deployment workflow will run automatically and your site will be live.

## Project Structure

- `src/App.jsx`: Main application logic.
- `src/lib/storage.js`: Handles saving/loading data from localStorage.
- `src/styles/`: CSS files.
