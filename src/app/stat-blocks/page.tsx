"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatBlockView, defaultStatBlock } from "@/components/stat-block";
import type { StatBlockData } from "@/components/stat-block";
import { ArrowLeft, Printer, Plus, Trash2, Scroll } from "lucide-react";

export default function StatBlocksPage() {
  const [statBlock, setStatBlock] = useState<StatBlockData>(defaultStatBlock);

  const updateField = <K extends keyof StatBlockData>(
    field: K,
    value: StatBlockData[K]
  ) => {
    setStatBlock((prev) => ({ ...prev, [field]: value }));
  };

  const updateAbility = (ability: keyof StatBlockData["abilities"], value: number) => {
    setStatBlock((prev) => ({
      ...prev,
      abilities: { ...prev.abilities, [ability]: value },
    }));
  };

  const addTrait = (section: "traits" | "actions" | "bonusActions" | "reactions" | "legendaryActions") => {
    const current = statBlock[section] || [];
    updateField(section, [...current, { name: "New Entry", description: "Description here..." }]);
  };

  const updateTrait = (
    section: "traits" | "actions" | "bonusActions" | "reactions" | "legendaryActions",
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const current = [...(statBlock[section] || [])];
    current[index] = { ...current[index], [field]: value };
    updateField(section, current);
  };

  const removeTrait = (
    section: "traits" | "actions" | "bonusActions" | "reactions" | "legendaryActions",
    index: number
  ) => {
    const current = [...(statBlock[section] || [])];
    current.splice(index, 1);
    updateField(section, current);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 print:bg-white print:min-h-0">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-900/20 text-amber-500">
                <Scroll className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Stat Block Generator</h1>
                <p className="text-zinc-500 text-sm">Create D&D 5e stat blocks</p>
              </div>
            </div>
          </div>
          <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-500 text-white">
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 print:p-0 print:max-w-none">
        <div className="flex flex-col lg:flex-row gap-8 print:block">
          {/* Editor Panel */}
          <div className="flex-1 print:hidden">
            <ScrollArea className="h-[calc(100vh-140px)] pr-4">
              <div className="space-y-4">
              {/* Basic Info */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-zinc-200">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="name" className="text-zinc-400 text-xs">Name</Label>
                      <Input
                        id="name"
                        value={statBlock.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="size" className="text-zinc-400 text-xs">Size</Label>
                      <Input
                        id="size"
                        value={statBlock.size}
                        onChange={(e) => updateField("size", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type" className="text-zinc-400 text-xs">Type</Label>
                      <Input
                        id="type"
                        value={statBlock.type}
                        onChange={(e) => updateField("type", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="alignment" className="text-zinc-400 text-xs">Alignment</Label>
                      <Input
                        id="alignment"
                        value={statBlock.alignment}
                        onChange={(e) => updateField("alignment", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Combat Stats */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-zinc-200">Combat Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="ac" className="text-zinc-400 text-xs">Armor Class</Label>
                      <Input
                        id="ac"
                        type="number"
                        value={statBlock.armorClass}
                        onChange={(e) => updateField("armorClass", parseInt(e.target.value) || 0)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="acType" className="text-zinc-400 text-xs">AC Type</Label>
                      <Input
                        id="acType"
                        value={statBlock.armorType || ""}
                        onChange={(e) => updateField("armorType", e.target.value)}
                        placeholder="e.g., natural armor"
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hp" className="text-zinc-400 text-xs">Hit Points</Label>
                      <Input
                        id="hp"
                        type="number"
                        value={statBlock.hitPoints}
                        onChange={(e) => updateField("hitPoints", parseInt(e.target.value) || 0)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hitDice" className="text-zinc-400 text-xs">Hit Dice</Label>
                      <Input
                        id="hitDice"
                        value={statBlock.hitDice}
                        onChange={(e) => updateField("hitDice", e.target.value)}
                        placeholder="e.g., 4d8 + 4"
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="speed" className="text-zinc-400 text-xs">Speed</Label>
                      <Input
                        id="speed"
                        value={statBlock.speed}
                        onChange={(e) => updateField("speed", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ability Scores */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-zinc-200">Ability Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {(["str", "dex", "con", "int", "wis", "cha"] as const).map((ability) => (
                      <div key={ability} className="text-center">
                        <Label className="text-[10px] uppercase text-zinc-500 font-semibold">{ability}</Label>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={statBlock.abilities[ability]}
                          onChange={(e) => updateAbility(ability, parseInt(e.target.value) || 10)}
                          className="text-center bg-zinc-800/50 border-zinc-700 text-white h-9"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Proficiencies & Senses */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-zinc-200">Proficiencies & Senses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="saves" className="text-zinc-400 text-xs">Saving Throws</Label>
                    <Input
                      id="saves"
                      value={statBlock.savingThrows?.join(", ") || ""}
                      onChange={(e) => updateField("savingThrows", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      placeholder="e.g., Int +5, Wis +4"
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills" className="text-zinc-400 text-xs">Skills</Label>
                    <Input
                      id="skills"
                      value={statBlock.skills?.join(", ") || ""}
                      onChange={(e) => updateField("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      placeholder="e.g., Arcana +5, Stealth +3"
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="senses" className="text-zinc-400 text-xs">Senses</Label>
                      <Input
                        id="senses"
                        value={statBlock.senses || ""}
                        onChange={(e) => updateField("senses", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="languages" className="text-zinc-400 text-xs">Languages</Label>
                      <Input
                        id="languages"
                        value={statBlock.languages || ""}
                        onChange={(e) => updateField("languages", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cr" className="text-zinc-400 text-xs">Challenge Rating</Label>
                      <Input
                        id="cr"
                        value={statBlock.challengeRating}
                        onChange={(e) => updateField("challengeRating", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="xp" className="text-zinc-400 text-xs">Experience Points</Label>
                      <Input
                        id="xp"
                        type="number"
                        value={statBlock.experiencePoints || ""}
                        onChange={(e) => updateField("experiencePoints", parseInt(e.target.value) || undefined)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Traits/Actions Editor */}
              {(["traits", "actions", "bonusActions", "reactions", "legendaryActions"] as const).map((section) => (
                <Card key={section} className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium text-zinc-200 capitalize">
                        {section.replace(/([A-Z])/g, " $1").trim()}
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => addTrait(section)}
                        className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                  </CardHeader>
                  {(statBlock[section]?.length ?? 0) > 0 && (
                    <CardContent className="space-y-3 pt-0">
                      {(statBlock[section] || []).map((item, index) => (
                        <div key={index} className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={item.name}
                              onChange={(e) => updateTrait(section, index, "name", e.target.value)}
                              placeholder="Name"
                              className="flex-1 h-8 bg-zinc-800/50 border-zinc-700 text-white text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTrait(section, index)}
                              className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateTrait(section, index, "description", e.target.value)}
                            placeholder="Description"
                            rows={2}
                            className="bg-zinc-800/50 border-zinc-700 text-white text-sm resize-none"
                          />
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}

              {/* Description/Lore */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-zinc-200">Description / Lore</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={statBlock.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Background information, lore, or notes about this creature..."
                    rows={4}
                    className="bg-zinc-800/50 border-zinc-700 text-white resize-none placeholder:text-zinc-600"
                  />
                </CardContent>
              </Card>
            </div>
            </ScrollArea>
          </div>

          {/* Preview Panel */}
          <div className="w-full lg:w-[420px] shrink-0 print:w-full">
            <div className="lg:sticky lg:top-[88px] print:relative print:top-0">
              <h2 className="text-sm font-medium text-zinc-500 mb-3 print:hidden">Preview</h2>
              <StatBlockView data={statBlock} className="print:shadow-none print:max-w-none" />
            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0.5in;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
