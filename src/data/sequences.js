import { NODE_IDS } from './constants';

// A default, just for show and support custom editing.
// Not intended to be a meta recommendation for all classes.
export const DEFAULT_SEQUENCE = [
  // Activate everything at Level 1 (Unlocks)
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 1 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 1 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 1 },
  { nodeId: NODE_IDS.BOOST_2, targetLevel: 1 },
  { nodeId: NODE_IDS.BOOST_3, targetLevel: 1 },
  { nodeId: NODE_IDS.BOOST_4, targetLevel: 1 },
  { nodeId: NODE_IDS.COMMON_1, targetLevel: 1 },
  { nodeId: NODE_IDS.STAT_1, targetLevel: 1 },
  { nodeId: NODE_IDS.STAT_2, targetLevel: 1 },
  { nodeId: NODE_IDS.STAT_3, targetLevel: 1 },
];

import { SEQUENCE as HeroSequence } from './job/Hero';
import { SEQUENCE as RenSequence } from './job/Ren';
import { SEQUENCE as HayatoSequence } from './job/Hayato';

export const JOB_SEQUENCES = {
  Hero: HeroSequence,
  Ren: RenSequence,
  Hayato: HayatoSequence,
};

export const getSequence = (job) => {
  return JOB_SEQUENCES[job] || DEFAULT_SEQUENCE;
};
