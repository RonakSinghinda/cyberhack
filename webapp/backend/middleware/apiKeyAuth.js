const Settings = require('../models/Settings');
const User = require('../models/User');

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'Unauthorized: No API key provided in x-api-key header' });
  }

  try {
    const settings = await Settings.findOne({ apiKey }).populate('userId');

    if (!settings || !settings.userId) {
      return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }

    // Set the authenticated user on the request object
    req.user = settings.userId;
    req.userSettings = settings;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Authentication error: ' + err.message });
  }
};

module.exports = { apiKeyAuth };
