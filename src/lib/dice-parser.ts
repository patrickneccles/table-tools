/**
 * Dice Expression Parser
 *
 * Supported syntax:
 *   d20, 2d6, 1d8+3, 2d6+1d4+5
 *   4d6dl1   — drop lowest 1
 *   4d6dh1   — drop highest 1
 *   4d6kh3   — keep highest 3
 *   4d6kl2   — keep lowest 2
 *   2d20kh1  — advantage (keep highest of 2d20)
 *   2d20kl1  — disadvantage
 *   d12 adv  — advantage on any die: d12 adv = 2d12kh1, 2d6 adv = 4d6kh2
 *   d12 dis  — disadvantage on any die: d12 dis = 2d12kl1
 *   adv / advantage   — standalone shorthand for 2d20kh1
 *   dis / disadvantage — standalone shorthand for 2d20kl1
 */

export type DropKeepKind = 'dl' | 'dh' | 'kh' | 'kl';

export type DropKeepOp = {
  kind: DropKeepKind;
  count: number;
};

export type DiceGroup = {
  count: number;
  sides: number;
  op?: DropKeepOp;
};

export type ParsedExpression = {
  groups: DiceGroup[];
  modifier: number;
};

export class DiceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiceParseError';
  }
}

/** Maximum dice count allowed for drop/keep (enumeration-based) */
export const MAX_DROP_KEEP_DICE = 8;

/** Maximum dice count for simple rolls */
export const MAX_DICE_COUNT = 100;

export function parseDiceExpression(raw: string): ParsedExpression {
  // Normalize: lowercase, collapse whitespace, expand shorthands
  const expr = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    // NdM adv/dis — attach advantage/disadvantage to any die (must run before standalone replacements)
    // d12adv → 2d12kh1, 2d6adv → 4d6kh2
    .replace(/(\d*)d(\d+)(?:advantage|adv)/g, (_, countStr, sidesStr) => {
      const count = countStr ? parseInt(countStr, 10) : 1;
      return `${count * 2}d${sidesStr}kh${count}`;
    })
    .replace(/(\d*)d(\d+)(?:disadvantage|dis)/g, (_, countStr, sidesStr) => {
      const count = countStr ? parseInt(countStr, 10) : 1;
      return `${count * 2}d${sidesStr}kl${count}`;
    })
    // Standalone adv/dis with no preceding die — default to d20
    .replace(/\badvantage\b/g, '2d20kh1')
    .replace(/\badv\b/g, '2d20kh1')
    .replace(/\bdisadvantage\b/g, '2d20kl1')
    .replace(/\bdis\b/g, '2d20kl1');

  if (!expr) {
    throw new DiceParseError('Expression cannot be empty.');
  }

  // Must contain at least one digit or 'd'
  if (!/[\dd]/.test(expr)) {
    throw new DiceParseError(`Cannot parse: "${raw}"`);
  }

  const groups: DiceGroup[] = [];
  let remaining = expr;

  // Match dice groups: [sign][count]d<sides>[drop/keep op]
  // The sign/count prefix is optional — + or - followed by digits
  const diceRe = /([+-]?\d*)d(\d+)(?:(kh|kl|dh|dl)(\d+))?/gi;
  let m: RegExpExecArray | null;

  while ((m = diceRe.exec(expr)) !== null) {
    const [fullMatch, countRaw, sidesStr, opKind, opCountStr] = m;

    // Strip sign from count (sign is just for sequencing in the expression)
    const countDigits = countRaw.replace(/^[+-]/, '');
    const count = countDigits ? parseInt(countDigits, 10) : 1;
    const sides = parseInt(sidesStr, 10);

    if (isNaN(sides) || sides < 2) {
      throw new DiceParseError(`Die must have at least 2 sides (got d${sidesStr}).`);
    }
    if (count < 1 || count > MAX_DICE_COUNT) {
      throw new DiceParseError(
        `Dice count must be between 1 and ${MAX_DICE_COUNT} (got ${count}).`
      );
    }

    let op: DropKeepOp | undefined;
    if (opKind && opCountStr) {
      const opCount = parseInt(opCountStr, 10);
      // Validate: you must keep/drop at least 1, and can't keep/drop all dice
      if (opCount < 1 || opCount >= count) {
        throw new DiceParseError(`Invalid ${opKind}${opCount} on ${count} dice.`);
      }
      if (count > MAX_DROP_KEEP_DICE) {
        throw new DiceParseError(
          `Drop/keep supports at most ${MAX_DROP_KEEP_DICE} dice (got ${count}).`
        );
      }
      op = { kind: opKind as DropKeepKind, count: opCount };
    }

    groups.push({ count, sides, op });
    // Replace this dice term so modifiers can be parsed from what remains
    remaining = remaining.replace(fullMatch, '+0');
  }

  // Parse flat modifier from whatever is left after removing dice groups
  remaining = remaining.replace(/\+0/g, '').replace(/^\+/, '');

  let modifier = 0;
  if (remaining) {
    const parts = remaining.match(/[+-]?\d+/g);
    if (parts) {
      modifier = parts.reduce((sum, p) => sum + parseInt(p, 10), 0);
    } else {
      throw new DiceParseError(`Cannot parse modifier: "${remaining}"`);
    }
  }

  if (groups.length === 0 && modifier === 0) {
    throw new DiceParseError(`Expression produces no result: "${raw}"`);
  }

  return { groups, modifier };
}
