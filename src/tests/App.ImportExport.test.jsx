// src/tests/App.ImportExport.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
// Mock storage before loading App
vi.mock('../lib/storage', async () => {
  return {
    loadState: vi.fn(() => ({
      version: 2,
      characters: {
        char1: { id: 'char1', name: 'TestChar', job: 'Hero', level: 260, skillProgress: {} },
      },
      activeCharacterId: null,
      characterOrder: ['char1'],
    })),
    saveState: vi.fn(),
  };
});

describe('App Import/Export', () => {
  let originalFileReader;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    global.URL.createObjectURL.mockClear();
    global.URL.revokeObjectURL.mockClear();

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Save original FileReader
    originalFileReader = global.FileReader;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('exports data correctly', async () => {
    render(<App />);

    // 1. Open Global Settings
    const settingsBtn = screen.getByTitle('Settings');
    fireEvent.click(settingsBtn);

    // 2. Click Export
    const exportBtn = screen.getByText('Export Data');
    fireEvent.click(exportBtn);

    // 3. Verify URL creation and download trigger
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    // Since we mocked createElement in setupTests, we can interpret success if no errors thrown
    // and URL.revoke called (cleanup)
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('imports data correctly', async () => {
    render(<App />);

    // Mock FileReader to return specific data
    const mockData = {
      version: 2,
      characters: {
        imported1: { id: 'imported1', name: 'Imported', job: 'Bishop', level: 270, skillProgress: {} },
      },
      activeCharacterId: null,
      characterOrder: ['imported1'],
    };
    const fileContent = JSON.stringify(mockData);

    // Create a spy for readAsText to verify it was called
    const readAsTextSpy = vi.fn();

    // implement MockFileReader
    class MockFileReader {
      constructor() {
        this.onload = null;
      }
      readAsText(file) {
        readAsTextSpy(file);
        // Trigger onload immediately
        if (this.onload) {
          this.onload({ target: { result: fileContent } });
        }
      }
    }
    global.FileReader = MockFileReader;

    // 1. Open Global Settings
    const settingsBtn = screen.getByTitle('Settings');
    fireEvent.click(settingsBtn);

    // 2. Trigger Import (simulate file selection)
    // Find hidden input
    const fileInput = screen.getAllByDisplayValue('').find((el) => el.type === 'file');

    const file = new File([fileContent], 'data.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 3. Verify Mock Reader was called
    expect(readAsTextSpy).toHaveBeenCalled();

    // 4. Verify Confirm Dialog
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('OVERWRITE'));

    // 5. Verify UI Update (Wait for re-render)
    await waitFor(() => {
      expect(screen.getByText('Imported')).toBeInTheDocument();
      expect(screen.getByText('Bishop')).toBeInTheDocument();
    });
  });

  it('handles invalid import data gracefully', async () => {
    render(<App />);

    const fileContent = '{}'; // Valid JSON, but missing required structure

    class MockFileReader {
      constructor() {
        this.onload = null;
      }
      readAsText() {
        // Trigger onload immediately
        if (this.onload) {
          this.onload({ target: { result: fileContent } });
        }
      }
    }
    global.FileReader = MockFileReader;

    // 1. Trigger Import
    const settingsBtn = screen.getByTitle('Settings');
    fireEvent.click(settingsBtn);
    const fileInput = screen.getAllByDisplayValue('').find((el) => el.type === 'file');
    const file = new File([fileContent], 'data.json', { type: 'application/json' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // 2. Verify Alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Invalid data'));
    });
  });
});
