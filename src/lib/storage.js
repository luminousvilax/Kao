import { DEFAULT_STATE, CURRENT_VERSION } from './stateSchema';

const STORAGE_KEY = 'maplestory_hexa_tracker_v1';

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw);

    // Basic migration check (can be expanded later)
    if (parsed.version !== CURRENT_VERSION) {
      console.warn('Version mismatch, resetting to default for safety');
      return DEFAULT_STATE;
    }

    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.error('Failed to load state', e);
    return DEFAULT_STATE;
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};
