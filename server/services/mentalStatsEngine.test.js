const { computeMentalStats } = require('./mentalStatsEngine');

test('should return san 100 and hp 100 when no physicalStats provided', () => {
  const result = computeMentalStats([], {});
  expect(result).toEqual({ san: 100, hp: 100 });
});
