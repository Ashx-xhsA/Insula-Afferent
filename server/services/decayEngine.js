// Decay Engine v1 — linear decay, independent rate per stat

const { STAT_MIN, STAT_MAX } = require('../config/constants');

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Compute the decayed value for a single stat.
 * @param {object} params
 * @param {number} params.currentValue - Current stat value (can exceed STAT_MAX due to buffs)
 * @param {number} params.decayCycleHours - Hours for stat to decay from STAT_MAX to STAT_MIN
 * @param {number} params.elapsedMs - Milliseconds elapsed since last update
 * @returns {number} New stat value, clamped to minimum of STAT_MIN
 */
function computeDecayedValue({ currentValue, decayCycleHours, elapsedMs }) {
  if (decayCycleHours <= 0) {
    throw new Error('decayCycleHours must be greater than 0');
  }

  // Negative elapsed time (clock skew) treated as 0
  const effectiveElapsedMs = Math.max(0, elapsedMs);

  const ratePerMs = STAT_MAX / (decayCycleHours * MS_PER_HOUR);
  const decayed = currentValue - ratePerMs * effectiveElapsedMs;

  return Math.max(STAT_MIN, decayed);
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
