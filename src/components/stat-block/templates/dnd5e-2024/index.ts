import type { StatBlockTemplate } from "../../stat-block-utils";
import { blankTemplate } from "./blank";
import { goblinWarriorTemplate } from "./goblin-warrior";
import { trollTemplate } from "./troll";
import { abolethTemplate } from "./aboleth";
import { impTemplate } from "./imp";

export const DND5E_2024_TEMPLATES: StatBlockTemplate[] = [
  { id: "blank-2024", name: "Blank (2024)", description: "Start from scratch", isSRD: false, systemId: "dnd5e-2024", data: blankTemplate },
  { id: "goblin-warrior-2024", name: "Goblin Warrior", description: "Small fey (CR 1/4)", isSRD: true, systemId: "dnd5e-2024", data: goblinWarriorTemplate },
  { id: "imp-2024", name: "Imp", description: "Tiny devil familiar (CR 1)", isSRD: true, systemId: "dnd5e-2024", data: impTemplate },
  { id: "troll-2024", name: "Troll", description: "Regenerating giant (CR 5)", isSRD: true, systemId: "dnd5e-2024", data: trollTemplate },
  { id: "aboleth-2024", name: "Aboleth", description: "Ancient aberration (CR 10)", isSRD: true, systemId: "dnd5e-2024", data: abolethTemplate },
];
