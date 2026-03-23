const { getEffectiveCoefficient } = require('./buffEngine');

test('should return 1 when no buffs are active', () => {
  expect(getEffectiveCoefficient([], 'Hunger')).toBe(1);
});
