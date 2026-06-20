const express = require('express');
const router = express.Router();
const { auditCompliance } = require('../controllers/complianceController');
const { protect } = require('../middleware/auth');

router.post('/audit', protect, auditCompliance);

module.exports = router;
