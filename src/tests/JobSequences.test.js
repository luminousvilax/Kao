
import { describe, it, expect } from 'vitest';
import { JOB_SEQUENCES } from '../data/sequences';
import { NODE_IDS } from '../data/constants';

const MAX_LEVELS = {
  // Skill Nodes (Max 30)
  [NODE_IDS.ORIGIN]: 30,
  [NODE_IDS.ASCENT]: 30,
  [NODE_IDS.MASTERY_1]: 30,
  [NODE_IDS.MASTERY_2]: 30,
  [NODE_IDS.MASTERY_3]: 30,
  [NODE_IDS.MASTERY_4]: 30,
  [NODE_IDS.BOOST_1]: 30,
  [NODE_IDS.BOOST_2]: 30,
  [NODE_IDS.BOOST_3]: 30,
  [NODE_IDS.BOOST_4]: 30,
  // Stat Nodes (Max 20)
  [NODE_IDS.STAT_1]: 20,
  [NODE_IDS.STAT_2]: 20,
  [NODE_IDS.STAT_3]: 20,
};

// Jobs known to be incomplete/WIP
const WIP_JOBS = [];

describe('Job Sequence Validation', () => {
  
  Object.keys(JOB_SEQUENCES).forEach(jobName => {
    // Skip known WIP jobs unless specifically targeted via -t flag?
    // Vitest doesn't easily expose filter args here. 
    // We'll define the test but mark as .skip if it's WIP.
    const runTest = WIP_JOBS.includes(jobName) ? describe.skip : describe;

    runTest(`${jobName} Sequence`, () => {
      const sequence = JOB_SEQUENCES[jobName];

      it('should provide a valid sequence array', () => {
        expect(sequence).toBeDefined();
        expect(Array.isArray(sequence)).toBe(true);
        // We allow empty sequences for placeholders, but if it has items, validate them
      });

      if (!sequence || sequence.length === 0) return;

      it('should reach max level for all required nodes', () => {
        const finalLevels = {};

        sequence.forEach(step => {
          finalLevels[step.nodeId] = step.targetLevel;
        });

        Object.entries(MAX_LEVELS).forEach(([nodeId, maxLevel]) => {
          // Check if node exists in final levels
          expect(finalLevels[nodeId], `Node ${nodeId} missing from sequence`).toBeDefined();
          // Check if max level is reached
          expect(finalLevels[nodeId], `Node ${nodeId} final level ${finalLevels[nodeId]} != ${maxLevel}`).toBe(maxLevel);
        });
      });

      it('should have strictly increasing target levels', () => {
        const currentLevels = {};

        sequence.forEach((step, index) => {
          const { nodeId, targetLevel } = step;
          const previousLevel = currentLevels[nodeId] || 0;

          if (targetLevel <= previousLevel) {
            throw new Error(
              `Step ${index} (${nodeId}): targetLevel ${targetLevel} <= previous ${previousLevel}`
            );
          }
          currentLevels[nodeId] = targetLevel;
        });
      });

    });
  });
});
