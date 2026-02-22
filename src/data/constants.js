// The standard Hexa Matrix slots available to all classes
export const SKILL_NODES = {
  ORIGIN: { id: 'origin', label: 'Origin Skill (H1)', type: 'skill' },
  ASCENT: { id: 'ascent', label: 'Ascent Skill (H2)', type: 'skill' },
  MASTERY_1: { id: 'm1', label: 'Mastery I (M1)', type: 'mastery' },
  MASTERY_2: { id: 'm2', label: 'Mastery II (M2)', type: 'mastery' },
  MASTERY_3: { id: 'm3', label: 'Mastery III (M3)', type: 'mastery' },
  MASTERY_4: { id: 'm4', label: 'Mastery IV (M4)', type: 'mastery' },
  BOOST_1: { id: 'b1', label: 'Boost I (B1)', type: 'boost' },
  BOOST_2: { id: 'b2', label: 'Boost II (B2)', type: 'boost' },
  BOOST_3: { id: 'b3', label: 'Boost III (B3)', type: 'boost' },
  BOOST_4: { id: 'b4', label: 'Boost IV (B4)', type: 'boost' },
  COMMON_1: { id: 'common_1', label: 'Sol Janus', type: 'common' },
  STAT_1: { id: 'stat_1', label: 'HEXA Stat I', type: 'stat' },
  STAT_2: { id: 'stat_2', label: 'HEXA Stat II', type: 'stat' },
  STAT_3: { id: 'stat_3', label: 'HEXA Stat III', type: 'stat' },
};

// Helper list for constants
export const NODE_IDS = Object.fromEntries(
  Object.entries(SKILL_NODES).map(([key, value]) => [key, value.id])
);
