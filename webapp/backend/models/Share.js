const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  text:         { type: String, required: true },
  passwordHash: { type: String, default: null }, // Optional hashed password
  expiration:   { type: Date, required: true },  // When the link expires
  maxViews:     { type: Number, default: 0 },    // Limit views (0 for unlimited)
  viewsCount:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Share', ShareSchema);
