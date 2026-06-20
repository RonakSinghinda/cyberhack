require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/scan',        require('./routes/scan'));
app.use('/api/redact',      require('./routes/redact'));
app.use('/api/settings',    require('./routes/settings'));
app.use('/api/compliance',  require('./routes/compliance'));
app.use('/api/share',       require('./routes/share'));

// Developer Public API Scan Endpoint
const { apiKeyAuth } = require('./middleware/apiKeyAuth');
const { analyzeText, redactText } = require('./utils/detection');
const Scan = require('./models/Scan');

app.post('/api/v1/scan', apiKeyAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Missing "text" parameter in request body' });
    }

    const { findings, riskScore } = analyzeText(text);
    const redactedText = redactText(text, findings, 'placeholder');
    const categories = [...new Set(findings.map(f => f.category))];

    // Log the scan record
    const scan = await Scan.create({
      userId: req.user._id,
      file_type: 'API',
      char_count: text.length,
      risk_score: riskScore,
      categories_found: categories,
      findings_count: findings.length,
      action_taken: 'API-Scan'
    });

    res.json({
      success: true,
      scan_id: scan.scan_id,
      risk_score: riskScore,
      findings_count: findings.length,
      findings: findings.map(f => ({
        category: f.category,
        severity: f.severity,
        label: f.label,
        index: f.index
      })),
      redacted_text: redactedText
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error: ' + err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SafeSearch API running on http://localhost:${PORT}`));
