import type { ShadowdarkData } from './types';
import { ABILITY_KEYS, ABILITY_LABELS, formatModifier } from './types';

export function generateShadowdarkMarkdown(data: ShadowdarkData): string {
  const lines: string[] = [];

  lines.push(`## ${data.name}`);
  if (data.description) lines.push(`*${data.description}*`);
  lines.push('');

  lines.push(
    [
      `**AC** ${data.armorClass ?? 10}`,
      `**HP** ${data.hitPoints ?? 1}`,
      `**ATK** ${data.attack ?? 'none'}`,
      `**MV** ${data.movement ?? 'near'}`,
    ].join(' | ')
  );

  const abilityStr = ABILITY_KEYS.map(
    (k) => `**${ABILITY_LABELS[k]}** ${formatModifier(data.abilityScores?.[k] ?? 0)}`
  ).join(', ');
  lines.push(`${abilityStr} | **AL** ${data.alignment ?? 'N'} | **LV** ${data.level ?? 1}`);

  if (data.features) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(data.features);
  }

  return lines.join('\n');
}
