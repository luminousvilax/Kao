# MapleStory Hexa Tracker - AI Developer Instructions

This is a React + Vite single-page application for tracking MapleStory 6th Job (Hexa) skill progression. It runs entirely in the browser using `localStorage` for persistence and is deployed via GitHub Pages.

## Core Architecture

- **State Management**:
  - Global state is a single JSON object managed in `src/App.jsx` and persisted to `localStorage` via `src/lib/storage.js`.
  - State schema is defined in `src/lib/stateSchema.js` (Current: **V2**).
  - Updates must use functional state setters (`setData(prev => ({...}))`) to ensure reliability.
- **Data Persistence**: 
  - **Auto-save**: Syncs to `localStorage` on change.
  - **Import/Export**: Users can backup/restore full app state (JSON) via `GlobalSettingsMenu` component.
- **Data Model**:
  - **Skill Nodes**: STRICTLY use constants from `src/data/constants.js` (e.g., `NODE_IDS.ORIGIN`, `NODE_IDS.MASTERY_1`).
  - **Jobs**: Static configuration in `src/data/jobs.js`. Modular data lives in `src/data/job/*.js`.
- **Routing**: Virtual routing via `activeCharacterId` state (Dashboard vs List view).

## Tech Stack & Libraries

- **Framework**: React + Vite.
- **Drag & Drop**: `@dnd-kit/*` for reordering lists (Priority Sequences).
- **Icons**: `src/components/Icons.jsx` (Lucide-based SVGs). Use `<Icons.Name />` instead of emojis for UI.
- **Styling**: Plain CSS with BEM naming conventions. No Tailwind/CSS-in-JS.
- **Testing**: `vitest` + `react-testing-library`.

## Development Workflows

- **Start Dev Server**: `npm run dev`
- **Lint & Format**: 
  - `npm run lint` (ESLint 9). **Strict**: Zero warnings allowed.
  - `npm run format` (Prettier).
  - **Rule**: Run before committing.
- **Testing**: 
  - `npm test` (matches `src/tests/*.test.jsx`).
  - **Mocking**: For file operations (`FileReader`, `URL.createObjectURL`), use the class-based mock pattern seen in `src/tests/App.ImportExport.test.jsx`.

## Project Conventions

1.  **Job Data Isolation**: 
    - Create `src/data/job/{JobName}.js`, import in `src/data/jobs.js`.
    - NEVER hardcode job data in components.
2.  **Asset Management**:
    - **Skill Icons**: `src/assets/skills/{jobName}/`. Reference in job data files.
    - **UI Icons**: Use `src/components/Icons.jsx`.
3.  **Skill IDs**: Use `NODE_IDS` keys (`origin`, `b1`, etc.) everywhere. Never use display labels as keys.

## Key Components

- **HexaGrid (`src/components/HexaGrid.jsx`)**: Core input matrix. Handles 0-30 node clamping.
- **PriorityList (`src/components/PriorityList.jsx`)**: 
  - Manages "Next Upgrades" checklist.
  - Includes `SequenceSettingsMenu` for importing/exporting job-specific sequences.
- **Icons (`src/components/Icons.jsx`)**: Central registry for SVG UI icons (Settings, Edit, Download, etc).