const express = require('express');
const router = express.Router();
const { 
  getSettings, 
  updateSettings, 
  generateApiKey, 
  revokeApiKey 
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.post('/apikey', protect, generateApiKey);
router.delete('/apikey', protect, revokeApiKey);

module.exports = router;
