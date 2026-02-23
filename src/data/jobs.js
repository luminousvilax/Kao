import { SKILL_NODES, NODE_IDS } from './constants';

// Known MapleStory job branches/classes for the dropdown
export const JOB_GROUPS = {
  "Explorers": [
    "Hero", "Paladin", "Dark Knight",
    "Arch Mage (Fire/Poison)", "Arch Mage (Ice/Lightning)", "Bishop",
    "Bowmaster", "Marksman", "Pathfinder",
    "Night Lord", "Shadower", "Dual Blade",
    "Buccaneer", "Corsair", "Cannoneer"
  ],
  "Cygnus Knights": [
    "Dawn Warrior", "Blaze Wizard", "Wind Archer", "Night Walker", "Thunder Breaker", "Mihile"
  ],
  "Heroes": [
    "Aran", "Evan", "Luminous", "Mercedes", "Phantom", "Shade"
  ],
  "Resistance": [
    "Blaster", "Battle Mage", "Wild Hunter", "Mechanic", "Demon Slayer", "Demon Avenger", "Xenon"
  ],
  "Nova": [
    "Kaiser", "Kain", "Cadena", "Angelic Buster"
  ],
  "Flora": [
    "Adele", "Illium", "Khali", "Ark"
  ],
  "Anima": [
    "Ren", "Lara", "Hoyoung"
  ],
  "Sengoku": [
    "Hayato", "Kanna"
  ],
  "Jianghu": [
    "Lynn", "Mo Xuan" 
  ],
  "Other": [
    "Zero", "Kinesis"
  ]
};

export const JOBS = Object.values(JOB_GROUPS).flat();

import { DATA as HeroData } from './job/Hero';
import { DATA as HayatoData } from './job/Hayato';
import { DATA as RenData } from './job/Ren';

// Expanded metadata for specific jobs
export const JOB_DATA = {
  "Hero": HeroData,
  "Hayato": HayatoData,
  "Ren": RenData,
};

import solJanusIcon from '../assets/skills/common/sol_janus.png';

// Data for skills shared by all jobs (e.g. Sol Janus)
export const COMMON_SKILL_DATA = {
  [NODE_IDS.COMMON_1]: { name: "Sol Janus", icon: solJanusIcon },
};

export const getJobNodeData = (jobName, nodeId) => {
  const generic = Object.values(SKILL_NODES).find(n => n.id === nodeId);
  
  // Priority: Job-specific > Common-shared > Generic/Placeholder
  const specific = JOB_DATA[jobName]?.[nodeId] || COMMON_SKILL_DATA[nodeId];

  return {
    ...generic,
    displayName: specific?.name || generic?.label || nodeId,
    icon: specific?.icon || "❓" // Placeholder icon
  };
};

export { SKILL_NODES, NODE_IDS };


