import type { GenericSpellData } from './types';
import { spellLevelLabel } from './types';

export function generateGenericSpellMarkdown(data: GenericSpellData): string {
  const lines: string[] = [];

  lines.push(`## ${data.name}`);
  lines.push(`*${spellLevelLabel(data.level, data.school)}*`);
  lines.push('');

  lines.push('---');
  lines.push('');

  if (data.castingTime) lines.push(`**Casting Time** ${data.castingTime}`);
  if (data.range) lines.push(`**Range** ${data.range}`);
  if (data.components) lines.push(`**Components** ${data.components}`);
  if (data.duration) lines.push(`**Duration** ${data.duration}`);

  if (data.description) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(data.description);
  }

  const footer = [data.classes, data.source].filter(Boolean).join(' | ');
  if (footer) {
    lines.push('');
    lines.push(`*${footer}*`);
  }

  return lines.join('\n');
}
