import type { StatBlockTemplate } from "../../stat-block-utils";
import type { DnD5e2024Data } from "../../systems/dnd5e-2024/types";
import { goblinWarriorTemplate } from "./goblin-warrior";
import { cultistTemplate } from "./cultist";
import { trollTemplate } from "./troll";
import { abolethTemplate } from "./aboleth";

export const DND5E_2024_TEMPLATES: StatBlockTemplate<DnD5e2024Data>[] = [
  { id: "goblin-warrior-2024", name: "Goblin Warrior", description: "Small fey (CR 1/4)", isSRD: true, systemId: "dnd5e-2024", data: goblinWarriorTemplate },
  { id: "cultist-2024", name: "Cultist", description: "Dark devotee (CR 1/8)", isSRD: true, systemId: "dnd5e-2024", data: cultistTemplate },
  { id: "troll-2024", name: "Troll", description: "Regenerating giant (CR 5)", isSRD: true, systemId: "dnd5e-2024", data: trollTemplate },
  { id: "aboleth-2024", name: "Aboleth", description: "Ancient aberration (CR 10)", isSRD: true, systemId: "dnd5e-2024", data: abolethTemplate },
];
