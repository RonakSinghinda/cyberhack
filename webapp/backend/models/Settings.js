const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  sensitivity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  blocklist:   { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
