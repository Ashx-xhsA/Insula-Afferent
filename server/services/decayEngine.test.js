// TDD specs for Decay Engine v1 — linear decay, independent rate per stat

const { computeDecayedValue, applyDecayToAllStats } = require('./decayEngine');

describe('computeDecayedValue', () => {

  // --- Core linear decay behavior ---

  test('should decay a stat linearly over time', () => {
    // Hunger: 100 -> 0 in 6 hours. After 3 hours, should be at 50.
    const result = computeDecayedValue({
      currentValue: 100,
      decayCycleHours: 6,
      elapsedMs: 3 * 60 * 60 * 1000,
    });
    expect(result).toBeCloseTo(50, 1);
  });

  test('should never decay below 0', () => {
    const result = computeDecayedValue({
      currentValue: 100,
      decayCycleHours: 6,
      elapsedMs: 10 * 60 * 60 * 1000,
    });
    expect(result).toBe(0);
  });

  test('should return current value when no time has elapsed', () => {
    const result = computeDecayedValue({
      currentValue: 75,
      decayCycleHours: 6,
      elapsedMs: 0,
    });
    expect(result).toBe(75);
  });

  test('should handle partial values (stat not starting at 100)', () => {
    // Start at 50, 6h cycle → rate = 100/6 ≈ 16.67/hr
    // After 1h: 50 - 16.67 ≈ 33.33
    const result = computeDecayedValue({
      currentValue: 50,
      decayCycleHours: 6,
      elapsedMs: 1 * 60 * 60 * 1000,
    });
    expect(result).toBeCloseTo(33.33, 0);
  });

  test('should handle different decay rates per stat', () => {
    const hydration = computeDecayedValue({
      currentValue: 100,
      decayCycleHours: 3,
      elapsedMs: 1.5 * 60 * 60 * 1000,
    });
    const cleanliness = computeDecayedValue({
      currentValue: 100,
      decayCycleHours: 72,
      elapsedMs: 1.5 * 60 * 60 * 1000,
    });

    expect(hydration).toBeCloseTo(50, 1);
    expect(cleanliness).toBeCloseTo(97.92, 0);
  });

  // --- A. Upper bound / overflow ---

  test('should decay correctly when currentValue exceeds 100', () => {
    // Buff pushed value to 120. Decay rate is still based on cycle (100/6 per hr).
    // After 1h: 120 - 16.67 ≈ 103.33 — should NOT clamp to 100
    const result = computeDecayedValue({
      currentValue: 120,
      decayCycleHours: 6,
      elapsedMs: 1 * 60 * 60 * 1000,
    });
    expect(result).toBeCloseTo(103.33, 0);
  });

  // --- B. Invalid decayCycleHours ---

  test('should throw when decayCycleHours is 0', () => {
    expect(() =>
      computeDecayedValue({
        currentValue: 100,
        decayCycleHours: 0,
        elapsedMs: 1000,
      })
    ).toThrow();
  });

  test('should throw when decayCycleHours is negative', () => {
    expect(() =>
      computeDecayedValue({
        currentValue: 100,
        decayCycleHours: -5,
        elapsedMs: 1000,
      })
    ).toThrow();
  });

  // --- C. Negative elapsed time ---

  test('should not increase value when elapsedMs is negative', () => {
    // Clock skew / time rollback should not heal a stat
    const result = computeDecayedValue({
      currentValue: 50,
      decayCycleHours: 6,
      elapsedMs: -3600000,
    });
    expect(result).toBe(50); // unchanged, treat as 0 elapsed
  });

  // --- D. Floating-point precision at tiny intervals ---

  test('should not produce visible jump for 1ms elapsed', () => {
    const result = computeDecayedValue({
      currentValue: 100,
      decayCycleHours: 6,
      elapsedMs: 1,
    });
    // 1ms on a 6h cycle: loss ≈ 0.0000046 — effectively unchanged
    expect(result).toBeCloseTo(100, 2);
    expect(result).toBeLessThanOrEqual(100);
  });
});


describe('applyDecayToAllStats', () => {

  test('should decay all stats independently based on their own rates', () => {
    const stats = {
      hunger:    { value: 100, decayCycleHours: 6 },
      hydration: { value: 100, decayCycleHours: 3 },
      stamina:   { value: 100, decayCycleHours: 16 },
    };
    const elapsedMs = 3 * 60 * 60 * 1000;

    const result = applyDecayToAllStats(stats, elapsedMs);

    expect(result.hunger.value).toBeCloseTo(50, 1);
    expect(result.hydration.value).toBeCloseTo(0, 1);
    expect(result.stamina.value).toBeCloseTo(81.25, 0);
  });

  test('should not mutate the original stats object', () => {
    const stats = {
      hunger: { value: 80, decayCycleHours: 6 },
    };
    const result = applyDecayToAllStats(stats, 1 * 60 * 60 * 1000);

    expect(stats.hunger.value).toBe(80);
    expect(result.hunger.value).not.toBe(80);
  });

  test('should handle empty stats object', () => {
    const result = applyDecayToAllStats({}, 1000);
    expect(result).toEqual({});
  });
});