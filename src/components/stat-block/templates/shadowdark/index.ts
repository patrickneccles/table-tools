import type { StatBlockTemplate } from "../../stat-block-utils";
import type { ShadowdarkData } from "../../systems/shadowdark/types";
import { goblinStatBlock } from "./goblin";
import { cultistStatBlock } from "./cultist";
import { trollStatBlock } from "./troll";
import { abolethStatBlock } from "./aboleth";

export const SHADOWDARK_TEMPLATES: StatBlockTemplate<ShadowdarkData>[] = [
  {
    id: "shadowdark-goblin",
    name: "Goblin",
    systemId: "shadowdark",
    data: goblinStatBlock,
  },
  {
    id: "shadowdark-cultist",
    name: "Cultist",
    systemId: "shadowdark",
    data: cultistStatBlock,
  },
  {
    id: "shadowdark-troll",
    name: "Troll",
    systemId: "shadowdark",
    data: trollStatBlock,
  },
  {
    id: "shadowdark-aboleth",
    name: "Aboleth",
    systemId: "shadowdark",
    data: abolethStatBlock,
  },
];
