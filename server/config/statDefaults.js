// baseDecayRate in points/hour so value hits 0 at natural decay cycle
// Cleanliness: 100 / (3*24) ≈ 1.39/hr
// Hunger:      100 / 6     ≈ 16.67/hr
// Hydration:   100 / 3     ≈ 33.33/hr
// Stamina:     100 / 16    ≈ 6.25/hr
// Bladder:     100 / 4     ≈ 25.00/hr
// Environment: 100 / (7*24)≈ 0.60/hr

const statDefaults = [
  {
    name: 'Cleanliness',
    icon: '🚿',
    baseDecayRate: 1.39,
    threshold: 20,
  },
  {
    name: 'Hunger',
    icon: '🍽️',
    baseDecayRate: 16.67,
    threshold: 20,
  },
  {
    name: 'Hydration',
    icon: '💧',
    baseDecayRate: 33.33,
    threshold: 20,
  },
  {
    name: 'Stamina',
    icon: '⚡',
    baseDecayRate: 6.25,
    threshold: 20,
  },
  {
    name: 'Bladder',
    icon: '🚻',
    baseDecayRate: 25.0,
    threshold: 20,
  },
  {
    name: 'Environment',
    icon: '🏠',
    baseDecayRate: 0.6,
    threshold: 20,
  },
];

module.exports = statDefaults;
