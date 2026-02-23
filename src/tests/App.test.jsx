import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';

// Mock dependencies
vi.mock('../components/CharacterList', () => ({
  CharacterList: ({ onSelectCharacter }) => (
    <div data-testid="character-list">
      <button onClick={() => onSelectCharacter('char1')}>Select Char 1</button>
    </div>
  ),
}));
vi.mock('../components/CharacterCreator', () => ({
  CharacterCreator: () => <div data-testid="character-creator">Character Creator</div>,
}));
vi.mock('../components/HexaGrid', () => ({
  HexaGrid: () => <div data-testid="hexa-grid">Hexa Grid</div>,
}));
vi.mock('../components/PriorityList', () => ({
  PriorityList: () => <div data-testid="priority-list">Priority List</div>,
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('App Global Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the settings menu button', () => {
    render(<App />);
    const settingsButton = screen.getByTitle('Settings');
    expect(settingsButton).toBeInTheDocument();
  });

  it('opens and closes the settings menu', () => {
    render(<App />);
    const settingsButton = screen.getByTitle('Settings');

    // Open
    fireEvent.click(settingsButton);
    expect(screen.getByText('Import Data')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();

    // Close by clicking button again
    fireEvent.click(settingsButton);
    expect(screen.queryByText('Import Data')).not.toBeInTheDocument();
  });

  it('handles data export', () => {
    render(<App />);
    const settingsButton = screen.getByTitle('Settings');
    fireEvent.click(settingsButton);

    const exportButton = screen.getByText('Export Data');

    // Mock anchor click
    const link = { click: vi.fn(), href: '' };
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(link.download).toBe('maplestory-hexa-tracker-data.json');
    expect(appendChildSpy).toHaveBeenCalledWith(link);
    expect(link.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalledWith(link);
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('handles data import', async () => {
    render(<App />);
    const settingsButton = screen.getByTitle('Settings');
    fireEvent.click(settingsButton);

    const importButton = screen.getByText('Import Data');
    const fileInput = screen.getByDisplayValue(''); // Input is hidden but present. Or find by type/accept

    // Trigger file input click via button
    const clickSpy = vi.spyOn(fileInput, 'click');
    fireEvent.click(importButton);
    expect(clickSpy).toHaveBeenCalled();

    // Create a file to upload
    const mockState = { characters: { char1: { id: 'char1', name: 'Test' } } };
    const file = new File([JSON.stringify(mockState)], 'backup.json', { type: 'application/json' });

    // Upload file
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Since FileReader is async, we might need to wait for state update.
    // However, App internal state update might not be easily observable without looking at effects.
    // We can verify if localStorage.setItem was called with imported data.

    await waitFor(() => {
      // App saves to localStorage on change.
      // If import succeeds, it should update state and trigger save.
      // But App.jsx logic for loadState/saveState needs to be considered.
      // If `onImport` updates state, `useEffect` monitoring `state` calls `saveState`.
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });
});
