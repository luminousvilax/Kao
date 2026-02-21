import { SKILL_NODES, NODE_IDS } from './constants';

// Known MapleStory job branches/classes for the dropdown
export const JOBS = [
  // Warriors
  "Hero", "Paladin", "Dark Knight",
  "Dawn Warrior", "Mihile",
  "Aran", "Blaster", "Demon Slayer", "Demon Avenger",
  "Kaiser", "Adele", "Zero", "Hayato",

  // Magicians
  "Arch Mage (Fire/Poison)", "Arch Mage (Ice/Lightning)", "Bishop",
  "Blaze Wizard",
  "Evan", "Luminous", "Battle Mage",
  "Kinesis", "Illium", "Lara", "Beast Tamer", "Lynn", "Kanna",

  // Bowmen
  "Bowmaster", "Marksman", "Pathfinder",
  "Wind Archer",
  "Mercedes", "Wild Hunter",
  "Kain",

  // Thieves
  "Night Lord", "Shadower", "Dual Blade",
  "Night Walker",
  "Phantom", "Cadena", "Kali", "Hoyoung",

  // Pirates
  "Buccaneer", "Corsair", "Cannoneer",
  "Thunder Breaker",
  "Shade", "Mechanic", "Xenon", "Angelic Buster", "Ark"
].sort();

import { DATA as HeroData } from './job/Hero';

// Expanded metadata for specific jobs
export const JOB_DATA = {
  "Hero": HeroData
};

// Data for skills shared by all jobs (e.g. Sol Janus)
export const COMMON_SKILL_DATA = {
  [NODE_IDS.COMMON]: { name: "Sol Janus", icon: "🌌" }
};

export const getJobNodeData = (jobName, nodeId) => {
  const generic = Object.values(SKILL_NODES).find(n => n.id === nodeId);
  
  // Priority: Job-specific > Common-shared > Generic/Placeholder
  const specific = JOB_DATA[jobName]?.[nodeId] || COMMON_SKILL_DATA[nodeId];

  return {
    ...generic,
    displayName: specific?.name || generic?.label || nodeId,
    icon: specific?.icon || "⚪" // Placeholder icon
  };
};

export { SKILL_NODES, NODE_IDS };


