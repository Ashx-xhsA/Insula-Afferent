/**
 * Computes the effective decay coefficient for a stat given active Buffs.
 * @param {Array} buffs - Array of active Buff documents
 * @param {string} statName - The stat to compute coefficient for
 * @returns {number} Stacked multiplier coefficient (1 = no change)
 */
function getEffectiveCoefficient(_buffs, _statName) {
  return 1;
}

module.exports = { getEffectiveCoefficient };
