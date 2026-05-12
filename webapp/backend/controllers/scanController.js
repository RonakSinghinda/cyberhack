const Scan = require('../models/Scan');
const { analyzeText } = require('../utils/detection');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// POST /api/scan/text
const scanText = async (req, res) => {
  try {
    const { text, action_taken } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const { findings, riskScore } = analyzeText(text);
    const categories = [...new Set(findings.map(f => f.category))];

    const scan = await Scan.create({
      userId: req.user._id,
      file_type: 'Text',
      char_count: text.length,
      risk_score: riskScore,
      categories_found: categories,
      findings_count: findings.length,
      action_taken: action_taken || 'Scanned'
    });

    res.json({ scan, findings, riskScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Tesseract = require('tesseract.js');

// POST /api/scan/file
const scanFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let text = '';

    if (ext === 'txt') {
      text = req.file.buffer.toString('utf-8');
    } else if (ext === 'pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
      // OCR for images
      const { data: { text: ocrText } } = await Tesseract.recognize(req.file.buffer, 'eng');
      text = ocrText;
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use PDF, DOCX, TXT, or Images (PNG/JPG).' });
    }

    const { findings, riskScore } = analyzeText(text);
    const categories = [...new Set(findings.map(f => f.category))];

    const scan = await Scan.create({
      userId: req.user._id,
      file_type: ext.toUpperCase(),
      char_count: text.length,
      risk_score: riskScore,
      categories_found: categories,
      findings_count: findings.length,
      action_taken: 'Scanned'
    });

    res.json({ scan, findings, riskScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/scan/history
const getHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/scan/:id
const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!scan) return res.status(404).json({ message: 'Scan not found' });
    res.json({ message: 'Scan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { scanText, scanFile, getHistory, deleteScan };
