const mongoose = require('mongoose');

const buffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['environmental', 'user'], required: true },
  effects: [
    {
      statName: { type: String, required: true },
      coefficient: { type: Number, required: true },
    },
  ],
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
});

module.exports = mongoose.model('Buff', buffSchema);
