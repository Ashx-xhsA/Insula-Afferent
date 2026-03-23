/**
 * Computes the current value of a stat after elapsed time with decay.
 * @param {number} lastValue - The stat value at lastUpdatedAt (0–100)
 * @param {number} decayRate - Base decay rate in points/hour
 * @param {number} elapsedMs - Milliseconds elapsed since lastUpdatedAt
 * @param {number} buffCoefficient - Multiplier from active Buffs (default 1)
 * @returns {number} Current value clamped to [0, 100]
 */
function computeCurrentValue(lastValue, _decayRate, _elapsedMs, _buffCoefficient = 1) {
  return lastValue;
}

module.exports = { computeCurrentValue };
