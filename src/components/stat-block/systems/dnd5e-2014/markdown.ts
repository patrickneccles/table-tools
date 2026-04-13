import type { DnD5e2014Data } from './types';
import { ABILITY_KEYS, calculateModifier, formatModifier } from './types';

export function generateDnD5e2014Markdown(data: DnD5e2014Data): string {
  const lines: string[] = [];

  // Header
  lines.push(`## ${data.name}`);
  const typeStr = [data.size, data.type].filter(Boolean).join(' ');
  if (typeStr || data.alignment) {
    lines.push(`*${[typeStr, data.alignment].filter(Boolean).join(', ')}*`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Combat stats
  const acStr = data.armorType ? `${data.armorClass} (${data.armorType})` : String(data.armorClass);
  lines.push(`**Armor Class** ${acStr}`);
  lines.push(`**Hit Points** ${data.hitPoints}${data.hitDice ? ` (${data.hitDice})` : ''}`);
  if (data.speed) lines.push(`**Speed** ${data.speed}`);
  lines.push('');
  lines.push('---');
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
  lines.push('---');
  lines.push('');

  // Detail lines
  if (data.savingThrows?.length) lines.push(`**Saving Throws** ${data.savingThrows.join(', ')}`);
  if (data.skills?.length) lines.push(`**Skills** ${data.skills.join(', ')}`);
  if (data.damageVulnerabilities)
    lines.push(`**Damage Vulnerabilities** ${data.damageVulnerabilities}`);
  if (data.damageResistances) lines.push(`**Damage Resistances** ${data.damageResistances}`);
  if (data.damageImmunities) lines.push(`**Damage Immunities** ${data.damageImmunities}`);
  if (data.conditionImmunities) lines.push(`**Condition Immunities** ${data.conditionImmunities}`);
  if (data.senses) lines.push(`**Senses** ${data.senses}`);
  if (data.languages) lines.push(`**Languages** ${data.languages}`);
  const xpPart = data.experiencePoints ? ` (${data.experiencePoints.toLocaleString()} XP)` : '';
  lines.push(`**Challenge** ${data.challengeRating}${xpPart}`);

  // Traits flow directly after the divider (no heading, per 2014 style)
  if (data.traits) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(data.traits);
  }

  // Action sections
  const sections: Array<{ title: string; content?: string }> = [
    { title: 'Actions', content: data.actions },
    { title: 'Bonus Actions', content: data.bonusActions },
    { title: 'Reactions', content: data.reactions },
    { title: 'Legendary Actions', content: data.legendaryActions },
  ];

  for (const { title, content } of sections) {
    if (!content) continue;
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`### ${title}`);
    lines.push('');
    lines.push(content);
  }

  if (data.description) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`*${data.description}*`);
  }

  return lines.join('\n');
}
