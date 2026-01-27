import type { StatBlockTemplate } from "../../stat-block-utils";
import type { DnD5e2014Data } from "../../systems/dnd5e-2014/types";
import { goblinTemplate } from "./goblin";
import { cultistTemplate } from "./cultist";
import { trollTemplate } from "./troll";
import { abolethTemplate } from "./aboleth";

export const DND5E_2014_TEMPLATES: StatBlockTemplate<DnD5e2014Data>[] = [
  { id: "goblin", name: "Goblin", description: "Small humanoid (CR 1/4)", isSRD: true, systemId: "dnd5e-2014", data: goblinTemplate },
  { id: "cultist", name: "Cultist", description: "Dark devotee (CR 1/8)", isSRD: true, systemId: "dnd5e-2014", data: cultistTemplate },
  { id: "troll", name: "Troll", description: "Regenerating giant (CR 5)", isSRD: true, systemId: "dnd5e-2014", data: trollTemplate },
  { id: "aboleth", name: "Aboleth", description: "Ancient aberration (CR 10)", isSRD: true, systemId: "dnd5e-2014", data: abolethTemplate },
];
