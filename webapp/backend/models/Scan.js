const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scan_id:         { type: String },
  file_type:       { type: String, default: 'Text' },
  char_count:      { type: Number, default: 0 },
  risk_score:      { type: Number, default: 0, min: 0, max: 100 },
  categories_found:{ type: [String], default: [] },
  findings_count:  { type: Number, default: 0 },
  action_taken:    { type: String, default: 'Scanned' },
}, { timestamps: true });

// Auto-generate scan_id
ScanSchema.pre('save', async function () {
  if (!this.scan_id) {
    const count = await mongoose.model('Scan').countDocuments({ userId: this.userId });
    this.scan_id = `scan_${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Scan', ScanSchema);
