import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadState, saveState } from '../lib/storage';
import { DEFAULT_STATE_V2 } from '../lib/stateSchema';

describe('storage', () => {
  const STORAGE_KEY = 'maplestory_hexa_tracker_v1';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('returns default state if storage is empty', () => {
    const state = loadState();
    expect(state).toEqual(DEFAULT_STATE_V2);
  });

  it('loads and parses valid state', () => {
    const mockState = { ...DEFAULT_STATE_V2, someData: 'test' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));

    const state = loadState();
    expect(state).toEqual(mockState);
  });

  it('returns default state and logs error on invalid JSON', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEY, 'invalid json');

    const state = loadState();
    expect(state).toEqual(DEFAULT_STATE_V2);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('returns default state on version mismatch', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const oldState = { version: 'v1.0.0', data: 'old' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldState));

    const state = loadState();
    // Updated expectation to match single argument call
    expect(state).toEqual(DEFAULT_STATE_V2);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Version mismatch'));

    consoleSpy.mockRestore();
  });

  it('saves state successfully', () => {
    const stateToSave = { ...DEFAULT_STATE_V2, data: 'new' };
    saveState(stateToSave);

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(stored)).toEqual(stateToSave);
  });

  it('logs error if saving fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock setItem to throw
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('Quota exceeded');
    });

    saveState(DEFAULT_STATE_V2);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save state', expect.any(Error));

    localStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });
});
