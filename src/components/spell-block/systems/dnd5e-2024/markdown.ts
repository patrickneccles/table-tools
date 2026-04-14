import type { DnD5e2024SpellData } from './types';
import { spellLevelLabel } from './types';

export function generateDnD5e2024SpellMarkdown(data: DnD5e2024SpellData): string {
  const lines: string[] = [];

  lines.push(`## ${data.name}`);
  const levelLabel = spellLevelLabel(data.level, data.school);
  const subtitle = data.classes ? `${levelLabel} (${data.classes})` : levelLabel;
  lines.push(`*${subtitle}*`);
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

  if (data.source) {
    lines.push('');
    lines.push(`*${data.source}*`);
  }

  return lines.join('\n');
}
