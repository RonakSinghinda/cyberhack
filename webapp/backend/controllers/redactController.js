const { redactText } = require('../utils/detection');

// POST /api/redact
const redact = async (req, res) => {
  try {
    const { text, findings, style } = req.body;
    if (!text || !findings || !style)
      return res.status(400).json({ message: 'text, findings, and style are required' });

    const redacted = redactText(text, findings, style);
    res.json({ redacted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { redact };
