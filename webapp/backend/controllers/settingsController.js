const Settings = require('../models/Settings');
const crypto = require('crypto');

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) settings = await Settings.create({ userId: req.user._id });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const { sensitivity, blocklist } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { sensitivity, blocklist },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/settings/apikey - Generate a new API Key
const generateApiKey = async (req, res) => {
  try {
    const apiKey = 'ss_live_' + crypto.randomBytes(24).toString('hex');
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { apiKey },
      { new: true, upsert: true }
    );
    res.json({ apiKey: settings.apiKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/settings/apikey - Revoke API Key
const revokeApiKey = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $unset: { apiKey: "" } },
      { new: true }
    );
    res.json({ message: 'API key revoked successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings, generateApiKey, revokeApiKey };
