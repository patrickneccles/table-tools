/**
 * Feature flags — read from NEXT_PUBLIC_ENABLE_<TOOL> env vars.
 * Defaults to true (enabled) when the variable is not set, so existing
 * deployments continue to work without any .env changes.
 * Set to "false" to disable a tool.
 */

export type ToolId =
  | 'mood-board'
  | 'stat-blocks'
  | 'hex-map'
  | 'spell-blocks'
  | 'dice'
  | 'random-tables';

const ENV_KEYS: Record<ToolId, string> = {
  'mood-board': process.env.NEXT_PUBLIC_ENABLE_MOOD_BOARD ?? 'true',
  'stat-blocks': process.env.NEXT_PUBLIC_ENABLE_STAT_BLOCKS ?? 'true',
  'hex-map': process.env.NEXT_PUBLIC_ENABLE_HEX_MAP ?? 'true',
  'spell-blocks': process.env.NEXT_PUBLIC_ENABLE_SPELL_BLOCKS ?? 'true',
  dice: process.env.NEXT_PUBLIC_ENABLE_DICE ?? 'true',
  'random-tables': process.env.NEXT_PUBLIC_ENABLE_RANDOM_TABLES ?? 'true',
};

export function isToolEnabled(id: ToolId): boolean {
  return ENV_KEYS[id] !== 'false';
}
