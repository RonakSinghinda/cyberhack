const Share = require('../models/Share');
const bcrypt = require('bcryptjs');

const createShare = async (req, res) => {
  try {
    const { text, password, expirationMinutes, maxViews } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'No content provided to share' });
    }

    // Calculate expiration date
    const mins = parseInt(expirationMinutes) || 60; // Default 1 hour
    const expiration = new Date(Date.now() + mins * 60 * 1000);

    let passwordHash = null;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const share = await Share.create({
      text,
      passwordHash,
      expiration,
      maxViews: parseInt(maxViews) || 0,
      viewsCount: 0
    });

    res.status(201).json({
      success: true,
      shareId: share._id,
      expiration
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create share link: ' + err.message });
  }
};

const getShare = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body; // Password might be sent in POST payload to verify

    const share = await Share.findById(id);
    if (!share) {
      return res.status(404).json({ message: 'Share link not found or already deleted' });
    }

    // Check expiration
    if (new Date() > share.expiration) {
      await Share.findByIdAndDelete(id);
      return res.status(410).json({ message: 'Share link has expired' });
    }

    // Password validation check
    if (share.passwordHash) {
      if (!password) {
        return res.status(401).json({ passwordRequired: true, message: 'Password required' });
      }
      const isMatch = await bcrypt.compare(password.trim(), share.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ passwordRequired: true, message: 'Invalid password' });
      }
    }

    // Increment view count
    share.viewsCount += 1;
    await share.save();

    // Check self-destruct (maxViews view limit reached)
    const textToReturn = share.text;
    if (share.maxViews > 0 && share.viewsCount >= share.maxViews) {
      await Share.findByIdAndDelete(id);
    }

    res.json({
      success: true,
      text: textToReturn,
      selfDestructed: share.maxViews > 0 && share.viewsCount >= share.maxViews
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve share content: ' + err.message });
  }
};

module.exports = { createShare, getShare };
