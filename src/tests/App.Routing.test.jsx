import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { createCharacter, CURRENT_VERSION } from '../lib/stateSchema';

// -- Mocks --

vi.mock('../components/CharacterList', () => ({
  CharacterList: ({ characters, onSelect, onAdd }) => (
    <div data-testid="character-list">
      <h1>Character List</h1>
      <button onClick={onAdd} data-testid="add-btn">
        Add Character
      </button>
      <ul>
        {Object.values(characters).map((char) => (
          <li key={char.id}>
            <button data-testid={`select-${char.id}`} onClick={() => onSelect(char.id)}>
              Select {char.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  ),
}));

vi.mock('../components/CharacterCreator', () => ({
  CharacterCreator: ({ onCreate }) => (
    <div data-testid="character-creator">
      <button data-testid="create-confirm" onClick={() => onCreate({ name: 'NewChar', job: 'Hero', level: 260 })}>
        Confirm Create
      </button>
    </div>
  ),
}));

vi.mock('../components/HexaGrid', () => ({
  HexaGrid: () => <div data-testid="hexa-grid">Hexa Grid</div>,
}));

vi.mock('../components/PriorityList', () => ({
  PriorityList: () => <div data-testid="priority-list">Priority List</div>,
}));

vi.mock('../components/Icons', () => ({
  Icons: {
    Settings: () => <span>SettingsIcon</span>,
    Upload: () => <span>UploadIcon</span>,
    Download: () => <span>DownloadIcon</span>,
  },
}));

const STORAGE_KEY = 'maplestory_hexa_tracker_v1';

// -- Tests --

describe('App Routing (Hash Navigation)', () => {
  // Helper to pre-fill localStorage
  const saveState = (data = {}) => {
    const state = {
      version: CURRENT_VERSION,
      characters: {},
      characterOrder: [],
      activeCharacterId: null,
      ...data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.location.hash = '';
  });

  it('updates URL hash when a character is created', async () => {
    saveState(); // Ensure valid empty state
    render(<App />);

    // 1. Open Creator
    fireEvent.click(screen.getByTestId('add-btn'));

    // 2. Create Character
    fireEvent.click(screen.getByTestId('create-confirm'));

    // 3. Expect URL hash to contain Job-Name
    await waitFor(() => {
      expect(window.location.hash).toBe('#Hero-NewChar');
    });

    // 4. Expect to see Dashboard (Back button present)
    expect(screen.getByText('← Back to List')).toBeInTheDocument();
  });

  it('updates URL hash when a character is selected', async () => {
    const char = createCharacter('TestChar', 'Hero', 260);
    saveState({
      characters: { [char.id]: char },
      characterOrder: [char.id],
      activeCharacterId: null,
    });

    render(<App />);

    expect(screen.getByText(`Select ${char.name}`)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(`select-${char.id}`));

    // Wait for the hash change to trigger state update
    await waitFor(() => {
      expect(window.location.hash).toBe('#Hero-TestChar');
      expect(screen.getByText('← Back to List')).toBeInTheDocument();
    });
  });

  it('clears URL hash when clicking "Back to List"', () => {
    const char = createCharacter('TestChar', 'Hero', 260);
    saveState({
      characters: { [char.id]: char },
      characterOrder: [char.id],
      activeCharacterId: char.id,
    });

    // Set initial hash to match state
    window.location.hash = '#Hero-TestChar';

    render(<App />);

    expect(screen.getByText('← Back to List')).toBeInTheDocument();

    fireEvent.click(screen.getByText('← Back to List'));

    expect(window.location.hash).toBe('');
    expect(screen.getByText(`Select ${char.name}`)).toBeInTheDocument();
  });

  it('loads the correct character based on initial URL hash with slug', () => {
    const char = createCharacter('HashChar', 'Hero', 260);
    // State says active is null, but hash says char slug
    saveState({
      characters: { [char.id]: char },
      characterOrder: [char.id],
      activeCharacterId: null,
    });

    window.location.hash = '#Hero-HashChar';

    render(<App />);

    // Should sync to dashboard
    expect(screen.getByText('← Back to List')).toBeInTheDocument();
    expect(screen.getByText(/HashChar/)).toBeInTheDocument();
  });

  it('responds to browser back/forward buttons (hashchange event)', async () => {
    const char = createCharacter('NavChar', 'Hero', 260);
    saveState({
      characters: { [char.id]: char },
      characterOrder: [char.id],
      activeCharacterId: null,
    });

    render(<App />);

    // 1. Start at list
    expect(screen.getByText(`Select ${char.name}`)).toBeInTheDocument();

    // 2. Click to select (pushes hash)
    fireEvent.click(screen.getByTestId(`select-${char.id}`));

    await waitFor(() => {
      expect(screen.getByText('← Back to List')).toBeInTheDocument();
      expect(window.location.hash).toBe('#Hero-NavChar');
    });

    // 3. Simulate Browser Back
    act(() => {
      window.location.hash = ''; // Changing hash manually triggers hashchange in JSDOM
    });

    await waitFor(() => {
      expect(screen.getByText(`Select ${char.name}`)).toBeInTheDocument();
    });

    // 4. Simulate Browser Forward
    act(() => {
      window.location.hash = '#Hero-NavChar';
    });

    await waitFor(() => {
      expect(screen.getByText('← Back to List')).toBeInTheDocument();
    });
  });

  it('cleans up invalid hash URL', () => {
    // Start with empty localStorage
    saveState({});

    // Set a hash for a non-existent character
    window.location.hash = '#non-existent-id';

    render(<App />);

    // 1. Ensures we fall back to the character list
    expect(screen.getByText('Character List')).toBeInTheDocument();

    // 2. Ensures the invalid hash is removed from the URL
    expect(window.location.hash).toBe('');
  });
});
