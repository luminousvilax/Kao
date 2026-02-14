import { NODE_IDS } from './jobs';

// A "balanced" default enhancement path that mixes improving Origin with unlocking other cores.
// This is a heuristic default, not a class-perfect meta.
export const generateDefaultSequence = () => {
  return [
    // 1. Activate everything at Level 1 (Unlocks)
    { nodeId: NODE_IDS.ORIGIN, targetLevel: 1 },
    { nodeId: NODE_IDS.MASTERY_1, targetLevel: 1 },
    { nodeId: NODE_IDS.BOOST_1, targetLevel: 1 },
    { nodeId: NODE_IDS.MASTERY_2, targetLevel: 1 },
    { nodeId: NODE_IDS.BOOST_2, targetLevel: 1 },
    { nodeId: NODE_IDS.COMMON, targetLevel: 1 },
    
    // 2. Early Origin gains
    { nodeId: NODE_IDS.ORIGIN, targetLevel: 9 }, // Big jump at 10 usually, so prep for it
    { nodeId: NODE_IDS.ORIGIN, targetLevel: 10 },

    // 3. Pump Mastery to decent levels
    { nodeId: NODE_IDS.MASTERY_1, targetLevel: 10 },
    { nodeId: NODE_IDS.MASTERY_2, targetLevel: 10 },

    // 4. Boost nodes foundation
    { nodeId: NODE_IDS.BOOST_1, targetLevel: 10 },
    { nodeId: NODE_IDS.BOOST_2, targetLevel: 10 },

    // 5. Max Origin
    { nodeId: NODE_IDS.ORIGIN, targetLevel: 20 },
    { nodeId: NODE_IDS.ORIGIN, targetLevel: 30 },

    // 6. Max Essence/Mastery
    { nodeId: NODE_IDS.MASTERY_1, targetLevel: 30 },
    { nodeId: NODE_IDS.MASTERY_2, targetLevel: 30 },

    // 7. Max Boosts
    { nodeId: NODE_IDS.BOOST_1, targetLevel: 30 },
    { nodeId: NODE_IDS.BOOST_2, targetLevel: 30 },
    
    // ... Fill rest if needed, this is just a starter sequence
  ];
};
