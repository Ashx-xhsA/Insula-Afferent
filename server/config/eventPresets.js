const eventPresets = [
  {
    name: 'Shower',
    icon: '🚿',
    effects: [{ statName: 'Cleanliness', delta: 80 }],
  },
  {
    name: 'Eat a Meal',
    icon: '🍽️',
    effects: [
      { statName: 'Hunger', delta: 60 },
      { statName: 'Stamina', delta: 10 },
    ],
  },
  {
    name: 'Cook',
    icon: '🍳',
    effects: [
      { statName: 'Hunger', delta: 60 },
      { statName: 'Stamina', delta: -15 },
    ],
  },
  {
    name: 'Clean the House',
    icon: '🧹',
    effects: [
      { statName: 'Environment', delta: 50 },
      { statName: 'Stamina', delta: -20 },
    ],
  },
  {
    name: 'Do Homework',
    icon: '📚',
    effects: [{ statName: 'Stamina', delta: -30 }],
  },
  {
    name: 'Drink Water',
    icon: '💧',
    effects: [{ statName: 'Hydration', delta: 40 }],
  },
  {
    name: 'Use Restroom',
    icon: '🚻',
    effects: [{ statName: 'Bladder', delta: 80 }],
  },
  {
    name: 'Sleep',
    icon: '😴',
    effects: [{ statName: 'Stamina', delta: 90 }],
  },
];

module.exports = eventPresets;
