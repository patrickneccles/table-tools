/**
 * Example: Integrating the Multi-System Stat Block Generator
 * 
 * This file shows how to update your existing stat block page
 * to support multiple systems.
 */

"use client";

import React, { useState } from "react";
import {
  // New system components
  SystemStatBlockView,
  SystemSelector,
  DEFAULT_SYSTEM_ID,
  transformBetweenSystems,
  
  // Legacy components (still work!)
  TraitEditor,
  EditorCard,
  TextInput,
  NumberInput,
  
  // Types
  type DnD5e2014Data,
  type DnD5e2024Data,
} from "@/components/stat-block";

/**
 * Example 1: Simple System-Aware Viewer
 */
export function SimpleSystemViewer() {
  const [systemId, setSystemId] = useState(DEFAULT_SYSTEM_ID);
  const [statBlockData] = useState<DnD5e2024Data>({
    name: "Goblin Scout",
    size: "Small",
    type: "humanoid",
    alignment: "neutral evil",
    armorClass: 15,
    initiative: 2,
    hitPoints: 7,
    hitDice: "2d6",
    speed: "30 ft.",
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    challengeRating: "1/4",
    experiencePoints: 50,
    proficiencyBonus: 2,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2>Stat Block Viewer</h2>
        <SystemSelector
          currentSystemId={systemId}
          onSystemChange={setSystemId}
        />
      </div>
      
      <SystemStatBlockView
        systemId={systemId}
        data={statBlockData}
      />
    </div>
  );
}

/**
 * Example 2: Editor with System Transformation
 */
export function EditorWithTransformation() {
  const [systemId, setSystemId] = useState<"dnd5e-2014" | "dnd5e-2024">("dnd5e-2024");
  const [statBlock2024, setStatBlock2024] = useState<DnD5e2024Data>({
    name: "Example Creature",
    size: "Medium",
    type: "humanoid",
    alignment: "neutral",
    armorClass: 10,
    initiative: 0,
    hitPoints: 10,
    hitDice: "2d8 + 2",
    speed: "30 ft.",
    abilities: { str: 10, dex: 10, con: 12, int: 10, wis: 10, cha: 10 },
    challengeRating: "1/2",
    experiencePoints: 100,
    proficiencyBonus: 2,
  });

  // Handle system change with transformation
  const handleSystemChange = (newSystemId: string) => {
    if (newSystemId === "dnd5e-2014" && systemId === "dnd5e-2024") {
      // User wants to view as 2014 - we can transform
      // (In real implementation, you'd maintain both versions)
      console.log("Would transform to 2014 format");
    }
    setSystemId(newSystemId as "dnd5e-2014" | "dnd5e-2024");
  };

  return (
    <div className="flex gap-8">
      {/* Editor Panel */}
      <div className="flex-1 space-y-4">
        <EditorCard title="Basic Information">
          <TextInput
            id="name"
            label="Name"
            value={statBlock2024.name}
            onChange={(v) => setStatBlock2024({ ...statBlock2024, name: v })}
          />
          {/* Add more fields... */}
        </EditorCard>
      </div>

      {/* Preview Panel */}
      <div className="w-96 space-y-4">
        <SystemSelector
          currentSystemId={systemId}
          onSystemChange={handleSystemChange}
          sourceSystemId="dnd5e-2024"
        />
        
        <SystemStatBlockView
          systemId={systemId}
          data={statBlock2024}
        />
      </div>
    </div>
  );
}

/**
 * Example 3: Converting Between Systems
 */
export function SystemConverter() {
  const data2014: DnD5e2014Data = {
    name: "Orc Warrior",
    size: "Medium",
    type: "humanoid (orc)",
    alignment: "chaotic evil",
    armorClass: 13,
    hitPoints: 15,
    hitDice: "2d8 + 6",
    speed: "30 ft.",
    abilities: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    skills: ["Intimidation +2"],
    senses: "darkvision 60 ft., passive Perception 10",
    languages: "Common, Orc",
    challengeRating: "1/2",
    experiencePoints: 100,
    traits: [
      {
        name: "Aggressive",
        description: "As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.",
      },
    ],
    actions: [
      {
        name: "Greataxe",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage.",
      },
    ],
  };

  // Transform to 2024 format
  const data2024 = transformBetweenSystems("dnd5e-2014", "dnd5e-2024", data2014) as DnD5e2024Data;

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-bold mb-4">2014 Edition</h3>
        <SystemStatBlockView
          systemId="dnd5e-2014"
          data={data2014}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-bold mb-4">2024 Edition (Converted)</h3>
        <SystemStatBlockView
          systemId="dnd5e-2024"
          data={data2024}
        />
      </div>
    </div>
  );
}

/**
 * Example 4: Backwards Compatibility
 * 
 * Your existing code still works! The legacy StatBlockView
 * component uses the 2014 system internally.
 */
import { StatBlockView, type StatBlockData } from "@/components/stat-block";

export function LegacyComponent() {
  const legacyData: StatBlockData = {
    name: "Classic Creature",
    size: "Medium",
    type: "beast",
    alignment: "unaligned",
    armorClass: 12,
    hitPoints: 11,
    hitDice: "2d8 + 2",
    speed: "40 ft.",
    abilities: { str: 14, dex: 15, con: 13, int: 2, wis: 12, cha: 6 },
    challengeRating: "1/4",
    experiencePoints: 50,
  };

  return (
    <div>
      <h3>Legacy Component (Still Works!)</h3>
      <StatBlockView data={legacyData} />
    </div>
  );
}
