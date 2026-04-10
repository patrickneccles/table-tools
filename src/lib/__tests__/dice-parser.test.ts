import { describe, it, expect } from 'vitest';
import { parseDiceExpression, DiceParseError } from '../dice-parser';

describe('parseDiceExpression', () => {
  describe('basic dice', () => {
    it('parses d20 (implicit count)', () => {
      const result = parseDiceExpression('d20');
      expect(result.groups).toEqual([{ count: 1, sides: 20, op: undefined }]);
      expect(result.modifier).toBe(0);
    });

    it('parses 2d6', () => {
      const result = parseDiceExpression('2d6');
      expect(result.groups).toEqual([{ count: 2, sides: 6, op: undefined }]);
      expect(result.modifier).toBe(0);
    });

    it('parses 1d8', () => {
      const result = parseDiceExpression('1d8');
      expect(result.groups[0]).toEqual({ count: 1, sides: 8, op: undefined });
    });
  });

  describe('modifiers', () => {
    it('parses positive modifier', () => {
      const result = parseDiceExpression('2d6+3');
      expect(result.modifier).toBe(3);
    });

    it('parses negative modifier', () => {
      const result = parseDiceExpression('d20-2');
      expect(result.modifier).toBe(-2);
    });

    it('parses compound modifier', () => {
      const result = parseDiceExpression('d20+5-3');
      expect(result.modifier).toBe(2);
    });
  });

  describe('multiple dice groups', () => {
    it('parses 2d6+1d4', () => {
      const result = parseDiceExpression('2d6+1d4');
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0]).toEqual({ count: 2, sides: 6, op: undefined });
      expect(result.groups[1]).toEqual({ count: 1, sides: 4, op: undefined });
      expect(result.modifier).toBe(0);
    });

    it('parses 2d6+1d4+3', () => {
      const result = parseDiceExpression('2d6+1d4+3');
      expect(result.groups).toHaveLength(2);
      expect(result.modifier).toBe(3);
    });
  });

  describe('drop/keep operations', () => {
    it('parses 4d6dl1 (drop lowest 1)', () => {
      const result = parseDiceExpression('4d6dl1');
      expect(result.groups[0].op).toEqual({ kind: 'dl', count: 1 });
    });

    it('parses 4d6kh3 (keep highest 3)', () => {
      const result = parseDiceExpression('4d6kh3');
      expect(result.groups[0].op).toEqual({ kind: 'kh', count: 3 });
    });

    it('parses 2d20kh1 (advantage)', () => {
      const result = parseDiceExpression('2d20kh1');
      expect(result.groups[0]).toEqual({ count: 2, sides: 20, op: { kind: 'kh', count: 1 } });
    });

    it('parses 2d20kl1 (disadvantage)', () => {
      const result = parseDiceExpression('2d20kl1');
      expect(result.groups[0].op).toEqual({ kind: 'kl', count: 1 });
    });
  });

  describe('shorthands', () => {
    it('expands adv to 2d20kh1', () => {
      const result = parseDiceExpression('adv');
      expect(result.groups[0]).toEqual({ count: 2, sides: 20, op: { kind: 'kh', count: 1 } });
    });

    it('expands dis to 2d20kl1', () => {
      const result = parseDiceExpression('dis');
      expect(result.groups[0]).toEqual({ count: 2, sides: 20, op: { kind: 'kl', count: 1 } });
    });

    it('attaches adv to any die — d12 adv = 2d12kh1', () => {
      const result = parseDiceExpression('d12 adv');
      expect(result.groups[0]).toEqual({ count: 2, sides: 12, op: { kind: 'kh', count: 1 } });
    });

    it('attaches dis to any die — d12 dis = 2d12kl1', () => {
      const result = parseDiceExpression('d12 dis');
      expect(result.groups[0]).toEqual({ count: 2, sides: 12, op: { kind: 'kl', count: 1 } });
    });

    it('attaches adv to multi-count die — 2d6 adv = 4d6kh2', () => {
      const result = parseDiceExpression('2d6 adv');
      expect(result.groups[0]).toEqual({ count: 4, sides: 6, op: { kind: 'kh', count: 2 } });
    });

    it('handles adv with modifier — d8 adv+3', () => {
      const result = parseDiceExpression('d8 adv+3');
      expect(result.groups[0]).toEqual({ count: 2, sides: 8, op: { kind: 'kh', count: 1 } });
      expect(result.modifier).toBe(3);
    });

    it('is case-insensitive', () => {
      const result = parseDiceExpression('2D6+3');
      expect(result.groups[0].sides).toBe(6);
      expect(result.modifier).toBe(3);
    });

    it('ignores whitespace', () => {
      const result = parseDiceExpression('2d6 + 3');
      expect(result.modifier).toBe(3);
    });
  });

  describe('error cases', () => {
    it('throws on empty input', () => {
      expect(() => parseDiceExpression('')).toThrow(DiceParseError);
    });

    it('throws on d1 (invalid sides)', () => {
      expect(() => parseDiceExpression('d1')).toThrow(DiceParseError);
    });

    it('throws when drop/keep count equals dice count', () => {
      expect(() => parseDiceExpression('4d6dl4')).toThrow(DiceParseError);
    });

    it('throws when drop/keep count exceeds dice count', () => {
      expect(() => parseDiceExpression('2d6kh3')).toThrow(DiceParseError);
    });
  });
});
