const mongoose = require('mongoose');

const statusSnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  snapshot: { type: Map, of: Number },
  mentalStats: {
    san: { type: Number },
    hp: { type: Number },
  },
  recordedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StatusSnapshot', statusSnapshotSchema);
