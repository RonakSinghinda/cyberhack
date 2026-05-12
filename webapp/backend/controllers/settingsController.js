const Settings = require('../models/Settings');

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

module.exports = { getSettings, updateSettings };
