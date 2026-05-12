const express = require('express');
const router = express.Router();
const { redact } = require('../controllers/redactController');
const { protect } = require('../middleware/auth');

router.post('/', protect, redact);

module.exports = router;
