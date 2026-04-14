import type { ShadowdarkSpellData } from './types';

export function generateShadowdarkSpellMarkdown(data: ShadowdarkSpellData): string {
  const lines: string[] = [];

  lines.push(`## ${data.name}`);
  const subtitle = [`Tier ${data.tier}`, data.classes].filter(Boolean).join(', ');
  lines.push(`*${subtitle}*`);
  lines.push('');

  if (data.duration) lines.push(`**Duration** ${data.duration}`);
  if (data.range) lines.push(`**Range** ${data.range}`);

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
