const express = require('express');
const router = express.Router();
const { createShare, getShare } = require('../controllers/shareController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createShare);
router.post('/:id/view', getShare); // Public access, POST so client can send password safely

module.exports = router;
