import type { DnD5e2024Data } from "../../systems/dnd5e-2024/types";

export const abolethTemplate: DnD5e2024Data = {
  name: "Aboleth",
  size: "Large",
  type: "aberration",
  alignment: "lawful evil",
  armorClass: 17,
  armorType: "natural armor",
  initiative: 7,
  hitPoints: 150,
  hitDice: "20d10 + 40",
  speed: "10 ft., swim 40 ft.",
  abilityScores: { str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 },
  savingThrows: ["Dex +3", "Con +6", "Int +8", "Wis +6"],
  skills: ["History +12", "Perception +10"],
  senses: "darkvision 120 ft., passive Perception 20",
  languages: "Deep Speech, telepathy 120 ft.",
  challengeRating: "10",
  experiencePoints: 5900,
  proficiencyBonus: 4,
  traits: [
    { name: "Amphibious", description: "The aboleth can breathe air and water." },
    { 
      name: "Eldritch Restoration", 
      description: "If destroyed, the aboleth gains a new body in 5d10 days, reviving with all its Hit Points in the Far Realm or another location chosen by the DM." 
    },
    { 
      name: "Legendary Resistance (3/Day, or 4/Day in Lair)", 
      description: "If the aboleth fails a saving throw, it can choose to succeed instead." 
    },
    { 
      name: "Mucus Cloud", 
      description: "While underwater, the aboleth is surrounded by mucus. Constitution Saving Throw: DC 14, each creature in a 5-foot Emanation at the end of the aboleth's turn. Failure: The target is cursed with slimy skin, can breathe air and water, and can't regain Hit Points unless underwater. While outside water, takes 6 (1d12) Acid damage every 10 minutes unless moisture is applied." 
    },
    { 
      name: "Probing Telepathy", 
      description: "If a creature communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires." 
    },
  ],
  actions: [
    { 
      name: "Multiattack", 
      description: "The aboleth makes two Tentacle attacks and uses either Consume Memories or Dominate Mind if available." 
    },
    { 
      name: "Tentacle", 
      description: "Melee Attack Roll: +9, reach 15 ft. Hit: 12 (2d6 + 5) Bludgeoning damage. If target is Large or smaller, it has the Grappled condition (escape DC 14)." 
    },
    { 
      name: "Consume Memories", 
      description: "Intelligence Saving Throw: DC 16, one creature within 30 feet that is Charmed or Grappled. Failure: 10 (3d6) Psychic damage. Success: Half damage. The aboleth gains the target's memories if the target is a Humanoid reduced to 0 Hit Points by this action." 
    },
    { 
      name: "Dominate Mind (2/Day)", 
      description: "Wisdom Saving Throw: DC 16, one creature within 30 feet. Failure: Charmed until the aboleth dies or is on another plane. While Charmed, acts as ally under aboleth's control within 60 feet. Target repeats save when taking damage and after 24 hours spent at least 1 mile away." 
    },
  ],
  legendaryActions: [
    { name: "Lash", description: "The aboleth makes one Tentacle attack." },
    { 
      name: "Psychic Drain", 
      description: "If the aboleth has at least one creature Charmed or Grappled, it uses Consume Memories and regains 5 (1d10) Hit Points." 
    },
  ],
};
