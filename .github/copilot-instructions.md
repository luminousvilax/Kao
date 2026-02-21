# MapleStory Hexa Tracker - AI Developer Instructions

This is a React + Vite single-page application for tracking MapleStory 6th Job (Hexa) skill progression. It runs entirely in the browser using `localStorage` for persistence and is deployed via GitHub Pages.

## Core Architecture

- **State Management**:
  - The entire app state is a single JSON object managed in `src/App.jsx` and persisted to `localStorage` via `src/lib/storage.js`.
  - State follows a strict schema defined in `src/lib/stateSchema.js`. Current version is **V2**.
  - **Pattern**: Updates typically flow up to `App.jsx` handlers (`handleCreateChar`, `handleHexaUpdate`) which then sync to `localStorage` using functional updates for immutability.
- **Data Model**:
  - **Characters**: Normalized in a `characters` map (ID -> Object) with a separate `characterOrder` array (for sorting).
  - **Skill Nodes**: Uses standardized constants from `src/data/constants.js` (e.g., `NODE_IDS.ORIGIN`, `NODE_IDS.MASTERY_1`). STRICTLY use these constants, never raw strings.
  - **Jobs**: Static configuration in `src/data/jobs.js`. Job-specific data (skills, icons, optimization sequences) is modularized in `src/data/job/*.js`. Do not fetch external job data.
- **Routing**: Virtual routing controlled by `activeCharacterId` in the global state.
  - `null`: Character List view.
  - `UUID`: Dashboard/Tracker view.

## Tech Stack & Libraries

- **Framework**: React + Vite.
- **Drag & Drop**: `@dnd-kit/*` for reordering lists (e.g., priority sequences).
- **Styling**: Plain CSS with BEM naming conventions. No Tailwind/CSS-in-JS.
- **Testing**: `vitest` + `react-testing-library`.

## Development Workflows

- **Start Dev Server**: `npm run dev`
- **Lint & Format**: 
  - `npm run lint` (ESLint 9 + React Plugins). **Strict**: Zero warnings allowed.
  - `npm run format` (Prettier).
  - **Rule**: Always run lint/format before committing. ESLint is configured to be strict about React Hooks dependencies.
- **Testing**: `npm test` (Vitest). Create tests in `src/tests/` mirroring component structure.
- **Build**: `npm run build` (outputs to `dist/`, used by GitHub Actions).

## Project Conventions

1.  **Immutability**: Logic in `App.jsx` handlers must use functional state updates (`setData(prev => ({...}))`) to ensure reliability.
2.  **Job Data Isolation**: 
    - **Do**: Add new jobs by creating `src/data/job/{JobName}.js` and importing it in `src/data/jobs.js`.
    - **Do not** hardcode job data in components. kept strictly in data files.
3.  **Skill IDs**: Use the standardized keys from `src/data/constants.js` (`origin`, `b1`, `m1`, etc.) everywhere. Never use display labels ("Origin Skill") as data keys.
4.  **Asset Management**:
    - Skill icons live in `src/assets/skills/{jobName}/`.
    - Reference them in job data files; components should receive resolved paths or emojis.

## Key Components

- **HexaGrid (`src/components/HexaGrid.jsx`)**:  
  - The core input matrix. Handles 0-30 clamping for all node types.
- **PriorityList (`src/components/PriorityList.jsx`)**:
  - Displays the "Next Upgrades" checklist. Derived from `prioritySequence` vs current `skillProgress`.
- **CharacterList (`src/components/CharacterList.jsx`)**:
  - Manages the list of characters and selection/deletion.

## deployment

- **GitHub Pages**: Deploys via `.github/workflows/deploy.yml` on push to `main`.
- **Base Path**: `vite.config.js` is set to relative base (`./`) to support generic Pages hosting.
