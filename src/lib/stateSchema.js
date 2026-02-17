import { generateDefaultSequence } from '../data/defaultSequence';

export const CURRENT_VERSION = 2;

export const DEFAULT_STATE_V2 = {
  version: CURRENT_VERSION,
  characters: {},
  activeCharacterId: null,
  characterOrder: [] // IDs in sorted order
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
      common: 0
    },
    prioritySequence: generateDefaultSequence()
  };
};

export const migrateV1ToV2 = (v1State) => {
  // If we had a V1 state, convert it to a character
  const char = {
    ...createCharacter(v1State.characterName || 'Migrated Char', 'Hero', v1State.level || 260),
    skillProgress: {
      origin: v1State.hexaSkills?.origin || 0,
      m1: v1State.hexaSkills?.mastery || 0,
      b1: v1State.hexaSkills?.enhance || 0,
      common: v1State.hexaSkills?.common || 0,
      // others default to 0 from createCharacter
    }
  };

  return {
    version: CURRENT_VERSION,
    characters: {
      [char.id]: char
    },
    activeCharacterId: char.id
  };
};
