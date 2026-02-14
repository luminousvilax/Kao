import { DEFAULT_STATE_V2, CURRENT_VERSION, migrateV1ToV2 } from './stateSchema';

const STORAGE_KEY = 'maplestory_hexa_tracker_v1'; // keep same key but upgrade contents

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE_V2;

    const parsed = JSON.parse(raw);

    // V1 -> V2 Migration
    if (parsed.version === 1) {
      console.log("Migrating V1 state to V2...");
      return migrateV1ToV2(parsed);
    }

    if (parsed.version !== CURRENT_VERSION) {
      console.warn('Version mismatch or unknown version, resetting to default safely');
      // In a real app we might try harder to salvage, 
      // but here we just return empty V2 state to avoid crashes
      return DEFAULT_STATE_V2;
    }

    return { ...DEFAULT_STATE_V2, ...parsed };
  } catch (e) {
    console.error('Failed to load state', e);
    return DEFAULT_STATE_V2;
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};
