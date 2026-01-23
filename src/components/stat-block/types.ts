export type AbilityScore = {
  name: string;
  value: number;
  modifier: number;
};

export type StatBlockData = {
  // Basic Info
  name: string;
  size: string;
  type: string;
  alignment: string;
  
  // Combat Stats
  armorClass: number;
  armorType?: string;
  hitPoints: number;
  hitDice: string;
  speed: string;
  
  // Ability Scores
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  
  // Proficiencies
  savingThrows?: string[];
  skills?: string[];
  
  // Resistances & Immunities
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  
  // Senses & Languages
  senses?: string;
  languages?: string;
  
  // Challenge
  challengeRating: string;
  experiencePoints?: number;
  
  // Traits & Abilities
  traits?: { name: string; description: string }[];
  actions?: { name: string; description: string }[];
  bonusActions?: { name: string; description: string }[];
  reactions?: { name: string; description: string }[];
  legendaryActions?: { name: string; description: string }[];
  
  // Lore
  description?: string;
};

export const defaultStatBlock: StatBlockData = {
  name: "Nezznar the Black Spider",
  size: "Medium",
  type: "humanoid (elf)",
  alignment: "neutral evil",
  
  armorClass: 11,
  armorType: "14 with mage armor",
  hitPoints: 27,
  hitDice: "6d8",
  speed: "30 ft.",
  
  abilities: {
    str: 9,
    dex: 13,
    con: 10,
    int: 16,
    wis: 14,
    cha: 13,
  },
  
  savingThrows: ["Int +5", "Wis +4"],
  skills: ["Arcana +5", "Perception +4", "Stealth +3"],
  
  senses: "darkvision 120 ft., passive Perception 14",
  languages: "Elvish, Undercommon",
  
  challengeRating: "2",
  experiencePoints: 450,
  
  traits: [
    {
      name: "Fey Ancestry",
      description: "Nezznar has advantage on saving throws against being charmed, and magic can't put him to sleep.",
    },
    {
      name: "Sunlight Sensitivity", 
      description: "While in sunlight, Nezznar has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight.",
    },
    {
      name: "Spellcasting",
      description: "Nezznar is a 4th-level spellcaster. His spellcasting ability is Intelligence (spell save DC 13, +5 to hit with spell attacks). He has the following wizard spells prepared:\n\nCantrips (at will): mage hand, ray of frost, shocking grasp\n1st level (4 slots): mage armor, magic missile, shield\n2nd level (3 slots): invisibility, suggestion",
    },
    {
      name: "Innate Spellcasting",
      description: "Nezznar can innately cast the following spells, requiring no material components:\n\nAt will: dancing lights\n1/day each: darkness, faerie fire",
    },
  ],
  
  actions: [
    {
      name: "Spider Staff",
      description: "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 2 (1d6 - 1) bludgeoning damage plus 3 (1d6) poison damage.",
    },
  ],
  
  description: "Drow (dark elves) are a devious, scheming subterranean race that worships Lolth, the Demon Queen of Spiders. Drow society is strictly matriarchal. Male drow are relegated to servitor roles, and while most train as warriors, a few, such as Nezznar, become skilled wizards.",
};

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
