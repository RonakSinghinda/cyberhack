const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanText, scanFile, scanBatch, getHistory, deleteScan } = require('../controllers/scanController');
const { protect } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/text', protect, scanText);
router.post('/file', protect, upload.single('file'), scanFile);
router.post('/batch', protect, upload.array('files', 20), scanBatch);
router.get('/history', protect, getHistory);
router.delete('/:id', protect, deleteScan);

module.exports = router;
