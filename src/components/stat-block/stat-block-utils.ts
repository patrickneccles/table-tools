import type { StatBlockData } from "./types";

// ============================================================================
// CR to XP Mapping (D&D 5e)
// ============================================================================

export const CR_XP_TABLE: Record<string, number> = {
  "0": 10,
  "1/8": 25,
  "1/4": 50,
  "1/2": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
  "6": 2300,
  "7": 2900,
  "8": 3900,
  "9": 5000,
  "10": 5900,
  "11": 7200,
  "12": 8400,
  "13": 10000,
  "14": 11500,
  "15": 13000,
  "16": 15000,
  "17": 18000,
  "18": 20000,
  "19": 22000,
  "20": 25000,
  "21": 33000,
  "22": 41000,
  "23": 50000,
  "24": 62000,
  "25": 75000,
  "26": 90000,
  "27": 105000,
  "28": 120000,
  "29": 135000,
  "30": 155000,
};

/** Get XP for a given CR */
export function getXPForCR(cr: string): number | undefined {
  return CR_XP_TABLE[cr];
}

/** Get CR for a given XP (finds closest match) */
export function getCRForXP(xp: number): string | undefined {
  const entries = Object.entries(CR_XP_TABLE);
  for (const [cr, xpValue] of entries) {
    if (xpValue === xp) return cr;
  }
  // Find closest
  let closest = entries[0];
  for (const entry of entries) {
    if (Math.abs(entry[1] - xp) < Math.abs(closest[1] - xp)) {
      closest = entry;
    }
  }
  return closest[0];
}

// ============================================================================
// Hit Dice Calculator
// ============================================================================

/** Parse hit dice string like "4d8 + 4" or "6d8" */
export function parseHitDice(hitDice: string): { count: number; die: number; modifier: number } | null {
  const match = hitDice.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/i);
  if (!match) return null;
  
  const count = parseInt(match[1]);
  const die = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3].replace(/\s/g, "")) : 0;
  
  return { count, die, modifier };
}

/** Calculate average HP from hit dice */
export function calculateAverageHP(hitDice: string): number | null {
  const parsed = parseHitDice(hitDice);
  if (!parsed) return null;
  
  const averageRoll = (parsed.die + 1) / 2;
  return Math.floor(parsed.count * averageRoll + parsed.modifier);
}

/** Generate hit dice string from HP and Constitution modifier */
export function generateHitDice(hp: number, conMod: number, size: string): string {
  const dieBySize: Record<string, number> = {
    tiny: 4,
    small: 6,
    medium: 8,
    large: 10,
    huge: 12,
    gargantuan: 20,
  };
  
  const die = dieBySize[size.toLowerCase()] || 8;
  const avgRoll = (die + 1) / 2;
  
  // Solve for dice count: hp = count * avgRoll + count * conMod
  // hp = count * (avgRoll + conMod)
  // count = hp / (avgRoll + conMod)
  const divisor = avgRoll + conMod;
  if (divisor <= 0) return `1d${die}`;
  
  const count = Math.max(1, Math.round(hp / divisor));
  const modifier = count * conMod;
  
  if (modifier === 0) return `${count}d${die}`;
  return modifier > 0 ? `${count}d${die} + ${modifier}` : `${count}d${die} - ${Math.abs(modifier)}`;
}

// ============================================================================
// Templates
// ============================================================================

export type StatBlockTemplate = {
  id: string;
  name: string;
  description: string;
  /** Whether this creature is part of the D&D 5.1 SRD (System Reference Document) */
  isSRD: boolean;
  data: StatBlockData;
};

const blankStatBlock: StatBlockData = {
  name: "New Creature",
  size: "Medium",
  type: "humanoid",
  alignment: "neutral",
  armorClass: 10,
  hitPoints: 4,
  hitDice: "1d8",
  speed: "30 ft.",
  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  challengeRating: "0",
  experiencePoints: 10,
};

const nezznarTemplate: StatBlockData = {
  name: "Nezznar the Black Spider",
  size: "Medium",
  type: "humanoid (elf)",
  alignment: "neutral evil",
  armorClass: 11,
  armorType: "14 with mage armor",
  hitPoints: 27,
  hitDice: "6d8",
  speed: "30 ft.",
  abilities: { str: 9, dex: 13, con: 10, int: 16, wis: 14, cha: 13 },
  savingThrows: ["Int +5", "Wis +4"],
  skills: ["Arcana +5", "Perception +4", "Stealth +3"],
  senses: "darkvision 120 ft., passive Perception 14",
  languages: "Elvish, Undercommon",
  challengeRating: "2",
  experiencePoints: 450,
  traits: [
    { name: "Fey Ancestry", description: "Nezznar has advantage on saving throws against being charmed, and magic can't put him to sleep." },
    { name: "Sunlight Sensitivity", description: "While in sunlight, Nezznar has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight." },
    { name: "Spellcasting", description: "Nezznar is a 4th-level spellcaster. His spellcasting ability is Intelligence (spell save DC 13, +5 to hit with spell attacks). He has the following wizard spells prepared:\n\nCantrips (at will): mage hand, ray of frost, shocking grasp\n1st level (4 slots): mage armor, magic missile, shield\n2nd level (3 slots): invisibility, suggestion" },
    { name: "Innate Spellcasting", description: "Nezznar can innately cast the following spells, requiring no material components:\n\nAt will: dancing lights\n1/day each: darkness, faerie fire" },
  ],
  actions: [
    { name: "Spider Staff", description: "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 2 (1d6 - 1) bludgeoning damage plus 3 (1d6) poison damage." },
  ],
  description: "Drow (dark elves) are a devious, scheming subterranean race that worships Lolth, the Demon Queen of Spiders. Drow society is strictly matriarchal. Male drow are relegated to servitor roles, and while most train as warriors, a few, such as Nezznar, become skilled wizards.",
};

const goblinTemplate: StatBlockData = {
  name: "Goblin",
  size: "Small",
  type: "humanoid (goblinoid)",
  alignment: "neutral evil",
  armorClass: 15,
  armorType: "leather armor, shield",
  hitPoints: 7,
  hitDice: "2d6",
  speed: "30 ft.",
  abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
  skills: ["Stealth +6"],
  senses: "darkvision 60 ft., passive Perception 9",
  languages: "Common, Goblin",
  challengeRating: "1/4",
  experiencePoints: 50,
  traits: [
    { name: "Nimble Escape", description: "The goblin can take the Disengage or Hide action as a bonus action on each of its turns." },
  ],
  actions: [
    { name: "Scimitar", description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage." },
    { name: "Shortbow", description: "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage." },
  ],
};

const trollTemplate: StatBlockData = {
  name: "Troll",
  size: "Large",
  type: "giant",
  alignment: "chaotic evil",
  armorClass: 15,
  armorType: "natural armor",
  hitPoints: 84,
  hitDice: "8d10 + 40",
  speed: "30 ft.",
  abilities: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 },
  skills: ["Perception +2"],
  senses: "darkvision 60 ft., passive Perception 12",
  languages: "Giant",
  challengeRating: "5",
  experiencePoints: 1800,
  traits: [
    { name: "Keen Smell", description: "The troll has advantage on Wisdom (Perception) checks that rely on smell." },
    { name: "Regeneration", description: "The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn't function at the start of the troll's next turn. The troll dies only if it starts its turn with 0 hit points and doesn't regenerate." },
  ],
  actions: [
    { name: "Multiattack", description: "The troll makes three attacks: one with its bite and two with its claws." },
    { name: "Bite", description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) piercing damage." },
    { name: "Claw", description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage." },
  ],
};

const abolethTemplate: StatBlockData = {
  name: "Aboleth",
  size: "Large",
  type: "aberration",
  alignment: "lawful evil",
  armorClass: 17,
  armorType: "natural armor",
  hitPoints: 135,
  hitDice: "18d10 + 36",
  speed: "10 ft., swim 40 ft.",
  abilities: { str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 },
  savingThrows: ["Con +6", "Int +8", "Wis +6"],
  skills: ["History +12", "Perception +10"],
  senses: "darkvision 120 ft., passive Perception 20",
  languages: "Deep Speech, telepathy 120 ft.",
  challengeRating: "10",
  experiencePoints: 5900,
  traits: [
    { name: "Amphibious", description: "The aboleth can breathe air and water." },
    { name: "Mucous Cloud", description: "While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 feet of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater." },
    { name: "Probing Telepathy", description: "If a creature communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires if the aboleth can see the creature." },
  ],
  actions: [
    { name: "Multiattack", description: "The aboleth makes three tentacle attacks." },
    { name: "Tentacle", description: "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature's skin becomes translucent and slimy, the creature can't regain hit points unless it is underwater, and the disease can be removed only by heal or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 (1d12) acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed." },
    { name: "Tail", description: "Melee Weapon Attack: +9 to hit, reach 10 ft. one target. Hit: 15 (3d6 + 5) bludgeoning damage." },
    { name: "Enslave (3/Day)", description: "The aboleth targets one creature it can see within 30 feet of it. The target must succeed on a DC 14 Wisdom saving throw or be magically charmed by the aboleth until the aboleth dies or until it is on a different plane of existence from the target. The charmed target is under the aboleth's control and can't take reactions, and the aboleth and the target can communicate telepathically with each other over any distance. Whenever the charmed target takes damage, the target can repeat the saving throw. On a success, the effect ends. No more than once every 24 hours, the target can also repeat the saving throw when it is at least 1 mile away from the aboleth." },
  ],
  legendaryActions: [
    { name: "Detect", description: "The aboleth makes a Wisdom (Perception) check." },
    { name: "Tail Swipe", description: "The aboleth makes one tail attack." },
    { name: "Psychic Drain (Costs 2 Actions)", description: "One creature charmed by the aboleth takes 10 (3d6) psychic damage, and the aboleth regains hit points equal to the damage the creature takes." },
  ],
};

const impTemplate: StatBlockData = {
  name: "Imp",
  size: "Tiny",
  type: "fiend (devil)",
  alignment: "lawful evil",
  armorClass: 13,
  hitPoints: 10,
  hitDice: "3d4 + 3",
  speed: "20 ft., fly 40 ft.",
  abilities: { str: 6, dex: 17, con: 13, int: 11, wis: 12, cha: 14 },
  skills: ["Deception +4", "Insight +3", "Persuasion +4", "Stealth +5"],
  damageResistances: "cold; bludgeoning, piercing, and slashing from nonmagical attacks not made with silvered weapons",
  damageImmunities: "fire, poison",
  conditionImmunities: "poisoned",
  senses: "darkvision 120 ft., passive Perception 11",
  languages: "Infernal, Common",
  challengeRating: "1",
  experiencePoints: 200,
  traits: [
    { name: "Shapechanger", description: "The imp can use its action to polymorph into a beast form that resembles a rat (speed 20 ft.), a raven (20 ft., fly 60 ft.), or a spider (20 ft., climb 20 ft.), or back into its true form. Its statistics are the same in each form, except for the speed changes noted. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies." },
    { name: "Devil's Sight", description: "Magical darkness doesn't impede the imp's darkvision." },
    { name: "Magic Resistance", description: "The imp has advantage on saving throws against spells and other magical effects." },
  ],
  actions: [
    { name: "Sting (Bite in Beast Form)", description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one." },
    { name: "Invisibility", description: "The imp magically turns invisible until it attacks or until its concentration ends (as if concentrating on a spell). Any equipment the imp wears or carries is invisible with it." },
  ],
};

export const STAT_BLOCK_TEMPLATES: StatBlockTemplate[] = [
  { id: "blank", name: "Blank", description: "Start from scratch", isSRD: false, data: blankStatBlock },
  { id: "goblin", name: "Goblin", description: "Small humanoid (CR 1/4)", isSRD: true, data: goblinTemplate },
  { id: "imp", name: "Imp", description: "Tiny devil familiar (CR 1)", isSRD: true, data: impTemplate },
  { id: "nezznar", name: "Nezznar the Black Spider", description: "Drow mage (CR 2)", isSRD: false, data: nezznarTemplate },
  { id: "troll", name: "Troll", description: "Regenerating giant (CR 5)", isSRD: true, data: trollTemplate },
  { id: "aboleth", name: "Aboleth", description: "Ancient aberration (CR 10)", isSRD: true, data: abolethTemplate },
];

// ============================================================================
// Local Storage Persistence
// ============================================================================

const STORAGE_KEY = "moodie-statblock-draft";

export function saveStatBlockToStorage(statBlock: StatBlockData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statBlock));
  } catch (e) {
    console.warn("Failed to save stat block to localStorage:", e);
  }
}

export function loadStatBlockFromStorage(): StatBlockData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as StatBlockData;
    }
  } catch (e) {
    console.warn("Failed to load stat block from localStorage:", e);
  }
  return null;
}

export function clearStatBlockStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear stat block from localStorage:", e);
  }
}
