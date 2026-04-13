import type { DnD5e2024Data } from './types';
import {
  ABILITY_KEYS,
  calculateInitiative,
  calculateModifier,
  calculateProficiencyBonus,
  formatModifier,
} from './types';

export function generateDnD5e2024Markdown(data: DnD5e2024Data): string {
  const lines: string[] = [];

  // Header
  lines.push(`## ${data.name}`);
  const typeStr = [data.size, data.type].filter(Boolean).join(' ');
  if (typeStr || data.alignment) {
    lines.push(`*${[typeStr, data.alignment].filter(Boolean).join(', ')}*`);
  }
  lines.push('');

  // Combat stats
  const acStr = data.armorType ? `${data.armorClass} (${data.armorType})` : String(data.armorClass);
  const hpStr = data.hitDice ? `${data.hitPoints} (${data.hitDice})` : String(data.hitPoints);
  const initMod = data.initiative ?? calculateInitiative(data.abilityScores?.dex ?? 10).modifier;
  lines.push(
    [
      `**AC** ${acStr}`,
      `**HP** ${hpStr}`,
      data.speed && `**Speed** ${data.speed}`,
      `**Initiative** ${formatModifier(initMod)} (${10 + initMod})`,
    ]
      .filter(Boolean)
      .join(' | ')
  );
  lines.push('');

  // Ability scores table
  lines.push(`| ${ABILITY_KEYS.map((k) => k.toUpperCase()).join(' | ')} |`);
  lines.push(`| ${ABILITY_KEYS.map(() => ':---:').join(' | ')} |`);
  lines.push(
    `| ${ABILITY_KEYS.map((k) => {
      const score = data.abilityScores?.[k] ?? 10;
      return `${score} (${formatModifier(calculateModifier(score))})`;
    }).join(' | ')} |`
  );
  lines.push('');

  // Detail lines
  if (data.savingThrows?.length) lines.push(`**Saving Throws** ${data.savingThrows.join(', ')}`);
  if (data.skills?.length) lines.push(`**Skills** ${data.skills.join(', ')}`);
  if (data.resistances) lines.push(`**Resistances** ${data.resistances}`);
  if (data.vulnerabilities) lines.push(`**Vulnerabilities** ${data.vulnerabilities}`);
  if (data.immunities) lines.push(`**Immunities** ${data.immunities}`);
  if (data.gear) lines.push(`**Gear** ${data.gear}`);
  if (data.senses) lines.push(`**Senses** ${data.senses}`);
  if (data.languages) lines.push(`**Languages** ${data.languages}`);
  const pb = data.proficiencyBonus ?? calculateProficiencyBonus(data.challengeRating);
  const xpPart = data.experiencePoints
    ? ` (XP ${data.experiencePoints.toLocaleString()}; PB ${formatModifier(pb)})`
    : '';
  lines.push(`**CR** ${data.challengeRating}${xpPart}`);

  // Feature sections
  const sections: Array<{ title: string; content?: string; preamble?: string }> = [
    { title: 'Traits', content: data.traits },
    { title: 'Actions', content: data.actions },
    { title: 'Bonus Actions', content: data.bonusActions },
    { title: 'Reactions', content: data.reactions },
    {
      title: 'Legendary Actions',
      content: data.legendaryActions,
      preamble: data.legendaryActionsPreamble,
    },
  ];

  for (const { title, content, preamble } of sections) {
    if (!content && !preamble) continue;
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`### ${title}`);
    if (preamble) {
      lines.push('');
      lines.push(preamble);
    }
    if (content) {
      lines.push('');
      lines.push(content);
    }
  }

  if (data.description) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`*${data.description}*`);
  }

  return lines.join('\n');
}
