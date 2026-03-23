// Decay Engine v1 — linear decay, independent rate per stat

/**
 * Compute the decayed value for a single stat.
 * @param {object} params
 * @param {number} params.currentValue - Current stat value (can exceed 100 due to buffs)
 * @param {number} params.decayCycleHours - Hours for stat to decay from 100 to 0
 * @param {number} params.elapsedMs - Milliseconds elapsed since last update
 * @returns {number} New stat value, clamped to minimum of 0
 */
function computeDecayedValue({ currentValue, decayCycleHours, elapsedMs }) {
  if (decayCycleHours <= 0) {
    throw new Error('decayCycleHours must be greater than 0');
  }

  // Negative elapsed time (clock skew) treated as 0
  const effectiveElapsedMs = Math.max(0, elapsedMs);

  const ratePerMs = 100 / (decayCycleHours * 60 * 60 * 1000);
  const decayed = currentValue - ratePerMs * effectiveElapsedMs;

  return Math.max(0, decayed);
}

/**
 * Apply decay to all stats in a stats object.
 * @param {object} stats - Map of stat name to { value, decayCycleHours }
 * @param {number} elapsedMs - Milliseconds elapsed since last update
 * @returns {object} New stats object with decayed values (original not mutated)
 */
function applyDecayToAllStats(stats, elapsedMs) {
  const result = {};
  for (const [key, stat] of Object.entries(stats)) {
    result[key] = {
      ...stat,
      value: computeDecayedValue({
        currentValue: stat.value,
        decayCycleHours: stat.decayCycleHours,
        elapsedMs,
      }),
    };
  }
  return result;
}

module.exports = { computeDecayedValue, applyDecayToAllStats };
