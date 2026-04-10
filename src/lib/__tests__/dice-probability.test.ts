import { describe, it, expect } from 'vitest';
import { parseDiceExpression } from '../dice-parser';
import {
  computeDistribution,
  computeStats,
  probabilityAtLeast,
  probabilityExactly,
} from '../dice-probability';

// Helper: sum of all probabilities should be ~1
function totalProbability(dist: { probs: number[] }): number {
  return dist.probs.reduce((s, p) => s + p, 0);
}

describe('computeDistribution', () => {
  describe('simple dice', () => {
    it('d6: uniform distribution 1–6', () => {
      const dist = computeDistribution(parseDiceExpression('d6'));
      expect(dist.min).toBe(1);
      expect(dist.probs).toHaveLength(6);
      for (const p of dist.probs) {
        expect(p).toBeCloseTo(1 / 6);
      }
    });

    it('d6: probabilities sum to 1', () => {
      const dist = computeDistribution(parseDiceExpression('d6'));
      expect(totalProbability(dist)).toBeCloseTo(1);
    });

    it('2d6: min 2, max 12', () => {
      const dist = computeDistribution(parseDiceExpression('2d6'));
      expect(dist.min).toBe(2);
      expect(dist.probs).toHaveLength(11);
    });

    it('2d6: mode is 7', () => {
      const dist = computeDistribution(parseDiceExpression('2d6'));
      const stats = computeStats(dist);
      expect(stats.mode).toBe(7);
    });

    it('2d6: P(7) = 6/36', () => {
      const dist = computeDistribution(parseDiceExpression('2d6'));
      expect(probabilityExactly(dist, 7)).toBeCloseTo(6 / 36);
    });

    it('2d6: probabilities sum to 1', () => {
      const dist = computeDistribution(parseDiceExpression('2d6'));
      expect(totalProbability(dist)).toBeCloseTo(1);
    });

    it('d20: uniform 1–20', () => {
      const dist = computeDistribution(parseDiceExpression('d20'));
      expect(dist.min).toBe(1);
      expect(dist.probs).toHaveLength(20);
      for (const p of dist.probs) {
        expect(p).toBeCloseTo(1 / 20);
      }
    });
  });

  describe('modifiers', () => {
    it('2d6+3: min is 5', () => {
      const dist = computeDistribution(parseDiceExpression('2d6+3'));
      expect(dist.min).toBe(5);
    });

    it('d20-2: min is -1', () => {
      const dist = computeDistribution(parseDiceExpression('d20-2'));
      expect(dist.min).toBe(-1);
    });
  });

  describe('drop/keep', () => {
    it('4d6dl1: min 3, max 18', () => {
      const dist = computeDistribution(parseDiceExpression('4d6dl1'));
      expect(dist.min).toBe(3);
      const max = dist.min + dist.probs.length - 1;
      expect(max).toBe(18);
    });

    it('4d6dl1: probabilities sum to 1', () => {
      const dist = computeDistribution(parseDiceExpression('4d6dl1'));
      expect(totalProbability(dist)).toBeCloseTo(1);
    });

    it('4d6dl1: mean is higher than 3d6 mean (10.5)', () => {
      const dist = computeDistribution(parseDiceExpression('4d6dl1'));
      const stats = computeStats(dist);
      expect(stats.mean).toBeGreaterThan(10.5);
    });

    it('2d20kh1 (advantage): mean > 10.5', () => {
      const dist = computeDistribution(parseDiceExpression('2d20kh1'));
      const stats = computeStats(dist);
      expect(stats.mean).toBeGreaterThan(10.5);
    });

    it('2d20kl1 (disadvantage): mean < 10.5', () => {
      const dist = computeDistribution(parseDiceExpression('2d20kl1'));
      const stats = computeStats(dist);
      expect(stats.mean).toBeLessThan(10.5);
    });

    it('advantage + disadvantage means are symmetric around 10.5', () => {
      const adv = computeStats(computeDistribution(parseDiceExpression('2d20kh1')));
      const dis = computeStats(computeDistribution(parseDiceExpression('2d20kl1')));
      expect(adv.mean + dis.mean).toBeCloseTo(21, 1); // symmetric around 10.5
    });
  });

  describe('probability queries', () => {
    it('d6: P(≥1) = 1', () => {
      const dist = computeDistribution(parseDiceExpression('d6'));
      expect(probabilityAtLeast(dist, 1)).toBeCloseTo(1);
    });

    it('d6: P(≥7) = 0', () => {
      const dist = computeDistribution(parseDiceExpression('d6'));
      expect(probabilityAtLeast(dist, 7)).toBe(0);
    });

    it('d20: P(≥11) = 0.5', () => {
      const dist = computeDistribution(parseDiceExpression('d20'));
      expect(probabilityAtLeast(dist, 11)).toBeCloseTo(0.5);
    });

    it('d6: P(=3) = 1/6', () => {
      const dist = computeDistribution(parseDiceExpression('d6'));
      expect(probabilityExactly(dist, 3)).toBeCloseTo(1 / 6);
    });

    it('d6: P(=7) = 0', () => {
      const dist = computeDistribution(parseDiceExpression('d6'));
      expect(probabilityExactly(dist, 7)).toBe(0);
    });
  });
});

describe('computeStats', () => {
  it('d6: mean 3.5', () => {
    const stats = computeStats(computeDistribution(parseDiceExpression('d6')));
    expect(stats.mean).toBeCloseTo(3.5);
  });

  it('2d6: mean 7', () => {
    const stats = computeStats(computeDistribution(parseDiceExpression('2d6')));
    expect(stats.mean).toBeCloseTo(7);
  });

  it('d6: min 1, max 6', () => {
    const stats = computeStats(computeDistribution(parseDiceExpression('d6')));
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(6);
  });
});
