# MapleStory Hexa Tracker

A browser-based tracker for MapleStory's 6th Job (Hexa) progression. This tool helps you manage your characters' Hexa matrix, track required resources, and plan your upgrade paths efficiently.

## Features

- **Browser Persistence**: Your data is saved automatically to your local browser storage (`localStorage`). No account required.
- **Multiple Characters**: Create and manage progression for multiple characters.
- **Custom Upgrade Plans**: Use the drag-and-drop edit mode to define and prioritize your own skill upgrade sequences.
- **Skill Progression**: Track levels for Origin, Mastery, Boost, and Common nodes.
- **Import/Export**: Easily sync your data between devices, or share custom sequence with friends.

## Development Status

Default upgrade sequences for all jobs are currently a work in progress.

**Available jobs with default sequences:**
- Hero
- Ren
- Hayato

## Data Reference & Methodology

Skill names and icons are referenced from [MapleStory Wiki](https://maplestorywiki.net/w/Characters_and_Skills).

The default upgrade sequences are primarily based on [音奈希莉亞's video guide](https://youtu.be/3PSDzAG9fb0?si=GNI_1lLJ4rRAeXGc), which includes updated ascent skills. If you find their content helpful, please consider liking and subscribing to support them.

Please note that the video's calculations are based on the TMS server and factor in the Mu Gong soul. This means burst skills might be prioritized higher than they would be in other regions, such as GMS. 

I have also referenced [Maplehub's fragment calculator](https://maplehub.app/fragment-calculator). However, its results seem tending to favor theoretical DPS, which can be difficult to achieve in actual boss battles, especially in Grandis and beyond.

As a result, the default sequences for some jobs I play have been adjusted based on my "personal experience" to provide a more practical, general-use upgrade path. 

If the default path doesn't suit your playstyle, you can always use **Edit Mode** to customize your own upgrade priority list!

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

The output will be generated in the `dist/` directory.

## Tech Stack

- **Framework**: React + Vite
- **State Management**: React Hooks + `localStorage`
- **Drag & Drop**: `@dnd-kit`
- **Styling**: Plain CSS (BEM convention)
- **Testing**: Vitest + React Testing Library

## Project Structure

```text
src/
├── App.jsx           # Main application state and logic
├── components/       # React components (HexaGrid, PriorityList, etc.)
├── data/             # Job configurations, skill constants, and sequences
├── lib/              # State schema and localStorage management
├── styles/           # Global CSS files
└── tests/            # Component and logic tests
```

## Contributing

Contributions are always welcome! Feel free to open issues or submit pull requests to add new jobs, improve default sequences, or enhance features.
