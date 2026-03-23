const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String },
  effects: [
    {
      statName: { type: String, required: true },
      delta: { type: Number, required: true },
    },
  ],
  isPinned: { type: Boolean, default: false },
  isCustom: { type: Boolean, default: false },
});

module.exports = mongoose.model('Event', eventSchema);
