import { NODE_IDS } from '../constants';

// Example: How to use image files
// 1. Put the image in src/assets/skills/Hero/
// 2. Import it:
// import spiritCaliburnIcon from '../../assets/skills/hero/h1.png';

// Specific skill names/icons for Hero
export const DATA = {
  [NODE_IDS.ORIGIN]: { name: "Spirit Caliburn", icon: "⚔️" }, // You can replace "⚔️" with spiritCaliburnIcon
  [NODE_IDS.MASTERY_1]: { name: "Raging Blow VI", icon: "🗡️" },
  [NODE_IDS.MASTERY_2]: { name: "Puncture VI", icon: "🤺" }, 
  [NODE_IDS.BOOST_1]: { name: "Burning Soul Blade", icon: "🔥" },
  [NODE_IDS.BOOST_2]: { name: "Instinctual Combo", icon: "🤜" },
  [NODE_IDS.BOOST_3]: { name: "Rage Uprising", icon: "😡" },
  [NODE_IDS.BOOST_4]: { name: "Worldreaver", icon: "🌍" },
};

// Hero-specific enhancement sequence
// Falls back to default if not fully specified, or can be a complete override
export const SEQUENCE = [
  // 1. Activate everything at Level 1 (Unlocks)
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 1 },
  // add more actual Hero-specific steps
];
