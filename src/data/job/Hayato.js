import { NODE_IDS } from '../constants';

import h1Icon from '../../assets/skills/hayato/h1_Shin_Quick_Draw.png';
import h2Icon from '../../assets/skills/hayato/h2_Fleeting_Breath.png';
import m1Icon from '../../assets/skills/hayato/m1_[Shinsoku]_Mist_Slash.png';
import m2Icon from '../../assets/skills/hayato/m2_[Shinsoku]_Silent_Arc.png';
import m3Icon from '../../assets/skills/hayato/m3_[Battou]_Dark_Moon_Cut.png';
import m4Icon from "../../assets/skills/hayato/m4_[Battou]_Full_Moon's_Rage.png";
import b1Icon from '../../assets/skills/hayato/b1_Shogetsu_Form.png';
import b2Icon from '../../assets/skills/hayato/b2_[Shinsoku]_Crashing_Tide.png';
import b3Icon from '../../assets/skills/hayato/b3_[Shinsoku]_Light_Cutter.png';
import b4Icon from '../../assets/skills/hayato/b4_[Battou]_Wailing_Heavens.png';

export const DATA = {
  [NODE_IDS.ORIGIN]: { name: 'Shin Quick Draw', icon: h1Icon },
  [NODE_IDS.ASCENT]: { name: 'Fleeting Breath', icon: h2Icon },
  [NODE_IDS.MASTERY_1]: { name: '[Shinsoku] Mist Slash VI\nAfterimage Slash VI', icon: m1Icon },
  [NODE_IDS.MASTERY_2]: { name: '[Shinsoku] Silent Arc VI\nCrescent Moon Cut VI', icon: m2Icon },
  [NODE_IDS.MASTERY_3]: { name: '[Battou] Dark Moon Cut VI', icon: m3Icon },
  [NODE_IDS.MASTERY_4]: { name: "[Battou] Full Moon's Rage VI", icon: m4Icon },
  [NODE_IDS.BOOST_1]: { name: 'Shogetsu Form', icon: b1Icon },
  [NODE_IDS.BOOST_2]: { name: '[Shinsoku] Crashing Tide', icon: b2Icon },
  [NODE_IDS.BOOST_3]: { name: '[Shinsoku] Light Cutter', icon: b3Icon },
  [NODE_IDS.BOOST_4]: { name: '[Battou] Wailing Heavens', icon: b4Icon },
};

export const SEQUENCE = [
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 1 },

  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 1 },
  { nodeId: NODE_IDS.BOOST_4, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 4 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 9 },
  { nodeId: NODE_IDS.BOOST_4, targetLevel: 4 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 4 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 3 },
  { nodeId: NODE_IDS.BOOST_4, targetLevel: 10 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 7 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 1 },

  { nodeId: NODE_IDS.STAT_1, targetLevel: 20 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 5 },
  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 14 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 7 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 3 },
  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 19 },
  { nodeId: NODE_IDS.STAT_2, targetLevel: 20 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 9 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 3 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 10 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 4 },
  { nodeId: NODE_IDS.BOOST_4, targetLevel: 12 },

  { nodeId: NODE_IDS.BOOST_2, targetLevel: 1 },
  { nodeId: NODE_IDS.STAT_3, targetLevel: 20 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 5 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 4 },
  { nodeId: NODE_IDS.BOOST_4, targetLevel: 20 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 9 },
  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 29 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 7 },
  { nodeId: NODE_IDS.BOOST_3, targetLevel: 1 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 15 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 9 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 7 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 13 },

  { nodeId: NODE_IDS.BOOST_4, targetLevel: 30 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 19 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 2 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 9 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 12 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 16 },
  { nodeId: NODE_IDS.MASTERY_4, targetLevel: 30 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 11 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 19 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 16 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 23 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 22 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 5 },

  { nodeId: NODE_IDS.BOOST_2, targetLevel: 4 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 25 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 19 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 12 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 25 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 29 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 28 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 7 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 23 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 15 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 12 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 19 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 29 },

  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 9 },
  { nodeId: NODE_IDS.ORIGIN, targetLevel: 30 },
  { nodeId: NODE_IDS.BOOST_2, targetLevel: 7 },
  { nodeId: NODE_IDS.BOOST_3, targetLevel: 4 },
  { nodeId: NODE_IDS.BOOST_2, targetLevel: 10 },
  { nodeId: NODE_IDS.BOOST_3, targetLevel: 10 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 29 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 14 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 12 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 19 },
  { nodeId: NODE_IDS.MASTERY_1, targetLevel: 30 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 17 },
  { nodeId: NODE_IDS.BOOST_2, targetLevel: 12 },

  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 19 },
  { nodeId: NODE_IDS.BOOST_2, targetLevel: 20 },
  { nodeId: NODE_IDS.MASTERY_3, targetLevel: 30 },
  { nodeId: NODE_IDS.BOOST_3, targetLevel: 12 },
  { nodeId: NODE_IDS.BOOST_1, targetLevel: 30 },
  { nodeId: NODE_IDS.BOOST_3, targetLevel: 20 },
  { nodeId: NODE_IDS.ASCENT, targetLevel: 30 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 29 },
  { nodeId: NODE_IDS.BOOST_2, targetLevel: 30 },
  { nodeId: NODE_IDS.BOOST_3, targetLevel: 30 },
  { nodeId: NODE_IDS.MASTERY_2, targetLevel: 30 },
];
