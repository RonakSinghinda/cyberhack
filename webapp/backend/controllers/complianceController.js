const { analyzeText } = require('../utils/detection');

const auditCompliance = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'No content provided for compliance audit' });
    }

    const { findings, riskScore } = analyzeText(text);

    // Initialize frameworks
    const gdpr = {
      name: 'GDPR (General Data Protection Regulation)',
      passed: true,
      score: 100,
      violations: []
    };

    const pci = {
      name: 'PCI-DSS (Payment Card Industry Data Security Standard)',
      passed: true,
      score: 100,
      violations: []
    };

    const hipaa = {
      name: 'HIPAA (Health Insurance Portability and Accountability Act)',
      passed: true,
      score: 100,
      violations: []
    };

    findings.forEach(f => {
      // PCI-DSS Mapping
      if (f.category === 'Financial') {
        pci.passed = false;
        pci.score = Math.max(0, pci.score - 25);
        if (!pci.violations.some(v => v.type === f.id)) {
          pci.violations.push({
            type: f.id,
            severity: f.severity,
            clause: 'PCI-DSS Req 3: Protect stored cardholder data',
            desc: `Detected raw financial identifier: ${f.label} ("${f.match}")`,
            fix: 'Mask bank account details or primary account numbers (PAN) using Redaction Studio.'
          });
        }
      }

      // GDPR Mapping
      if (f.category === 'PII' || f.category === 'Contact' || f.category === 'Credentials') {
        gdpr.passed = false;
        gdpr.score = Math.max(0, gdpr.score - 20);
        if (!gdpr.violations.some(v => v.type === f.id)) {
          gdpr.violations.push({
            type: f.id,
            severity: f.severity,
            clause: 'GDPR Article 6: Lawfulness of processing & Article 32: Security of processing',
            desc: `Detected raw personal identifier or credential: ${f.label} ("${f.match}")`,
            fix: 'Redact personal identifiers, contact fields, and credentials using a Placeholder style.'
          });
        }
      }

      // HIPAA Mapping
      if (f.category === 'Medical') {
        hipaa.passed = false;
        hipaa.score = Math.max(0, hipaa.score - 50);
        if (!hipaa.violations.some(v => v.type === 'medical')) {
          hipaa.violations.push({
            type: 'medical',
            severity: f.severity,
            clause: 'HIPAA Privacy Rule: Protection of Protected Health Information (PHI)',
            desc: `Detected diagnostic medical keyword: "${f.match}"`,
            fix: 'Remove all medical terminology or genericize health descriptors.'
          });
        }
      }
    });

    const overallScore = Math.round((gdpr.score + pci.score + hipaa.score) / 3);

    res.json({
      success: true,
      overallScore,
      riskScore,
      frameworks: { gdpr, pci, hipaa },
      findingsCount: findings.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Compliance audit failed: ' + err.message });
  }
};

module.exports = { auditCompliance };
