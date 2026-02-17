# MapleStory Hexa Tracker - AI Developer Instructions

This is a React + Vite single-page application for tracking MapleStory 6th Job (Hexa) skill progression. It runs entirely in the browser using `localStorage` for persistence and is deployed via GitHub Pages.

## Core Architecture

- **State Management**:
  - The entire app state is a single JSON object managed in `src/App.jsx` and persisted to `localStorage` via `src/lib/storage.js`.
  - State follows a strict schema defined in `src/lib/stateSchema.js`.
  - **Pattern**: Because this app is in development, when modifying state structure, no need to implement migrations, just update the schema, delete old schema if necessary to make code clean.
- **Data Model**:
  - **Characters**: Normalized in a `characters` map (ID -> Object) with a separate `characterOrder` array.
  - **Skill Nodes**: Hardcoded IDs (`origin`, `h2`, `m1`-`m4`, `b1`-`b4`, `common`) map to integer levels (0-30). See `src/data/jobs.js`.
  - **Sequences**: An ordered array of `{ nodeId: string, targetLevel: number }` used to guide user upgrades. Logic in `src/data/defaultSequence.js`.
- **Routing**: Pseudo-routing via `activeCharacterId` in state. Null = List View; UUID = Dashboard View.

## Development Workflows

- **Run Dev Server**: `npm run dev`
- **Lint & Format**: 
  - `npm run lint` (ESLint 9 + React Plugins).
  - `npm run format` (Prettier).
  - **Rule**: Always run lint/format before committing. ESLint is configured to be strict about React Hooks dependencies.
- **Build**: `npm run build` (outputs to `dist/`, used by GitHub Actions).
- **Write Tests**: When adding new logic or updating existing logic, create corresponding test files in `src/tests/` and use Vitest + React Testing Library.
- **Update README**: When adding features or changing user flows, update the README to reflect new instructions or screenshots.

## Key Components & Patterns

- **HexaGrid (`src/components/HexaGrid.jsx`)**:  
  - The core input matrix. Handles 0-30 clamping for all node types.
  - **Pattern**: Updates typically flow up to `App.jsx` handlers (`handleHexaUpdate`) which then sync to `localStorage`.
- **PriorityList (`src/components/PriorityList.jsx`)**:
  - Displays the "Next Upgrades" checklist.
  - **Pattern**: Derived state. It compares `prioritySequence` targets vs. current `skillProgress` to determine if a step is "Done".
- **Styling**:
  - Plain CSS in `src/styles/` or alongside components.
  - No CSS-in-JS or Tailwind currently. Use BEM-like naming (e.g., `.char-card`, `.char-card.active`).

## Project Conventions

1.  **Immutability**: logic in `App.jsx` handlers must use functional state updates (`setData(prev => ({...}))`) to ensure reliability.
2.  **Job Data**: Defined statically in `src/data/jobs.js`. Do not fetch external APIs for job data; this makes the app offline-capable and static-hostable.
3.  **Skill IDs**: Use the standardized keys from `SKILL_NODES` in `jobs.js` (`origin`, `b1`, `m1`, etc.) everywhere. Never use display labels ("Origin Skill") as data keys.

## Deployment

- **GitHub Pages**: Deploys via `.github/workflows/deploy.yml` on push to `main`.
- **Base Path**: `vite.config.js` is set to relative base (`./`) to support generic Pages hosting.
