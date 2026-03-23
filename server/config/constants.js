const STAT_MIN = 0;
const STAT_MAX = 100;

const DEFAULT_MENTAL_WEIGHTS = {
  san: {
    Cleanliness: 0.2,
    Hunger: 0.2,
    Hydration: 0.15,
    Stamina: 0.25,
    Bladder: 0.1,
    Environment: 0.1,
  },
  hp: {
    Cleanliness: 0.1,
    Hunger: 0.25,
    Hydration: 0.2,
    Stamina: 0.3,
    Bladder: 0.05,
    Environment: 0.1,
  },
};

const CASCADE_THRESHOLDS = {
  LOW_HYDRATION: 20,
  LOW_STAMINA: 20,
  LOW_HUNGER: 10,
  LOW_CLEANLINESS: 20,
};

module.exports = { STAT_MIN, STAT_MAX, DEFAULT_MENTAL_WEIGHTS, CASCADE_THRESHOLDS };
