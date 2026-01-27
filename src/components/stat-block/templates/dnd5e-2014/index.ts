import type { StatBlockTemplate } from "../../stat-block-utils";
import { blankTemplate } from "./blank";
import { goblinTemplate } from "./goblin";
import { impTemplate } from "./imp";
import { trollTemplate } from "./troll";
import { abolethTemplate } from "./aboleth";

export const DND5E_2014_TEMPLATES: StatBlockTemplate[] = [
  { id: "blank", name: "Blank", description: "Start from scratch", isSRD: false, systemId: "dnd5e-2014", data: blankTemplate },
  { id: "goblin", name: "Goblin", description: "Small humanoid (CR 1/4)", isSRD: true, systemId: "dnd5e-2014", data: goblinTemplate },
  { id: "imp", name: "Imp", description: "Tiny devil familiar (CR 1)", isSRD: true, systemId: "dnd5e-2014", data: impTemplate },
  { id: "troll", name: "Troll", description: "Regenerating giant (CR 5)", isSRD: true, systemId: "dnd5e-2014", data: trollTemplate },
  { id: "aboleth", name: "Aboleth", description: "Ancient aberration (CR 10)", isSRD: true, systemId: "dnd5e-2014", data: abolethTemplate },
];
