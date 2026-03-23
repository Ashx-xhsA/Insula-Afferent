const mongoose = require('mongoose');

const physicalStatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String },
  currentValue: { type: Number, default: 100, min: 0, max: 100 },
  lastUpdatedAt: { type: Date, default: Date.now },
  baseDecayRate: { type: Number, required: true },
  isCustom: { type: Boolean, default: false },
  threshold: { type: Number, default: 20 },
});

module.exports = mongoose.model('PhysicalStat', physicalStatSchema);
