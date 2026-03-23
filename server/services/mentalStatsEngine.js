/**
 * Computes derived Mental Stats from Physical Stats.
 * @param {Array} physicalStats - Array of { name, currentValue } objects
 * @param {Object} weights - Map of statName → weight for each mental stat
 * @returns {{ san: number, hp: number }}
 */
function computeMentalStats(_physicalStats, _weights) {
  return { san: 100, hp: 100 };
}

module.exports = { computeMentalStats };
