import { BACKGROUND_CONFIG } from '../data/constants';

export const CURRENT_VERSION = 2;

export const DEFAULT_STATE_V2 = {
  version: CURRENT_VERSION,
  characters: {},
  activeCharacterId: null,
  characterOrder: [], // IDs in sorted order
  background: {
    url: null,
    opacity: BACKGROUND_CONFIG.DEFAULT_OPACITY,
    blur: BACKGROUND_CONFIG.DEFAULT_BLUR,
  },
};

export const createCharacter = (name, job, level) => {
  const id = Date.now().toString();
  return {
    id,
    name,
    job,
    level: Number(level) || 260,
    skillProgress: {
      origin: 1,
      m1: 0,
      m2: 0,
      m3: 0,
      m4: 0,
      b1: 0,
      b2: 0,
      b3: 0,
      b4: 0,
      common_1: 0,
    },
    // prioritySequence removed to use global defaults unless customized
  };
};
