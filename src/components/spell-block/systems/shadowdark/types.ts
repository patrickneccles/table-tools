export type ShadowdarkSpellTier = '1' | '2' | '3' | '4' | '5';

export type ShadowdarkSpellData = {
  name: string;
  tier: ShadowdarkSpellTier;
  classes: string;
  duration: string;
  range: string;
  description: string;
};

export const TIER_OPTIONS = [
  { value: '1', label: 'Tier 1' },
  { value: '2', label: 'Tier 2' },
  { value: '3', label: 'Tier 3' },
  { value: '4', label: 'Tier 4' },
  { value: '5', label: 'Tier 5' },
] as const;
