const { computeCurrentValue } = require('./decayEngine');

test('should return lastValue when elapsed time is zero', () => {
  expect(computeCurrentValue(80, 16.67, 0, 1)).toBe(80);
});
