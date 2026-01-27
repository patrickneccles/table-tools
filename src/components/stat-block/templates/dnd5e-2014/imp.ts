import type { StatBlockData } from "../../types";

export const impTemplate: StatBlockData = {
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
