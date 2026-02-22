import { NODE_IDS } from '../constants';

import b1Icon from '../../assets/skills/hero/b1_Burning_Soul_Blade.png';
import b2Icon from '../../assets/skills/hero/b2_Instinctual_Combo.png';
import b3Icon from '../../assets/skills/hero/b3_Worldreaver.png';
import b4Icon from '../../assets/skills/hero/b4_Sword_Illusion.png';
import h1Icon from '../../assets/skills/hero/h1_Spirit_Calibur.png';
import h2Icon from '../../assets/skills/hero/h2_Ultrasonic_Slash.png';
import m1Icon from '../../assets/skills/hero/m1_Raging_Blow.png';
import m2Icon from '../../assets/skills/hero/m2_Rising_Rage.png';
import m3Icon from '../../assets/skills/hero/m3_Rending_Edge.png';
import m4Icon from '../../assets/skills/hero/m4_Cry_Valhalla.png';

// Specific skill names/icons for Hero
export const DATA = {
  [NODE_IDS.ORIGIN]: { name: "Spirit Calibur", icon: h1Icon },
  [NODE_IDS.ASCENT]: { name: "Ultrasonic Slash", icon: h2Icon },
  [NODE_IDS.MASTERY_1]: { name: "Raging Blow VI", icon: m1Icon },
  [NODE_IDS.MASTERY_2]: { name: "Rising Rage VI", icon: m2Icon },
  [NODE_IDS.MASTERY_3]: { name: "Beam Blade VI/Rending Edge", icon: m3Icon },
  [NODE_IDS.MASTERY_4]: { name: "Cry Valhalla/Puncture/Final Attack VI", icon: m4Icon },
  [NODE_IDS.BOOST_1]: { name: "Burning Soul Blade", icon: b1Icon },
  [NODE_IDS.BOOST_2]: { name: "Instinctual Combo", icon: b2Icon },
  [NODE_IDS.BOOST_3]: { name: "Worldreaver", icon: b3Icon },
  [NODE_IDS.BOOST_4]: { name: "Sword Illusion", icon: b4Icon },
};

// Hero-specific enhancement sequence
// Falls back to default if not fully specified, or can be a complete override
export const SEQUENCE = [
  // 1. Activate everything at Level 1 (Unlocks)
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
  // add more actual Hero-specific steps
];
