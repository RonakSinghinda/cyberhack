// Detection engine — server-side
const PATTERNS = [
  { id: 'credit_card',   category: 'Financial',   severity: 'High',   regex: /(?<![0-9])(?:4[0-9]{15}|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})(?![0-9])/g, label: 'Credit Card Number' },
  { id: 'bank_account',  category: 'Financial',   severity: 'High',   regex: /\b[0-9]{9,18}\b/g, label: 'Possible Bank Account' },
  { id: 'upi',           category: 'Financial',   severity: 'Medium', regex: /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g, label: 'UPI ID' },
  { id: 'ifsc',          category: 'Financial',   severity: 'Medium', regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g, label: 'IFSC Code' },
  { id: 'ssn',           category: 'PII',         severity: 'High',   regex: /\b(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/g, label: 'SSN' },
  { id: 'aadhaar',       category: 'PII',         severity: 'High',   regex: /\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b/g, label: 'Aadhaar Number' },
  { id: 'pan',           category: 'PII',         severity: 'High',   regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, label: 'PAN Card' },
  { id: 'passport',      category: 'PII',         severity: 'High',   regex: /\b[A-Z]{1}[0-9]{7}\b/g, label: 'Passport Number' },
  { id: 'dob',           category: 'PII',         severity: 'Medium', regex: /\b(?:dob|date of birth|born on|born)\s*[:\-]?\s*\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/gi, label: 'Date of Birth' },
  { id: 'email',         category: 'Contact',     severity: 'Medium', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: 'Email Address' },
  { id: 'phone',         category: 'Contact',     severity: 'Medium', regex: /\b(?:\+?91[-.\s]?)?[6-9]\d{9}\b/g, label: 'Phone Number' },
  { id: 'api_key',       category: 'Credentials', severity: 'High',   regex: /(?:api[_-]?key|token|secret|auth)[_-]?\s*[:=]\s*['"]?[A-Za-z0-9_\-\.]{20,}['"]?/gi, label: 'API Key / Token' },
  { id: 'ssh_key',       category: 'Credentials', severity: 'High',   regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, label: 'SSH Private Key' },
  { id: 'password',      category: 'Credentials', severity: 'High',   regex: /(?:password|passwd|pwd)\s*[:=]\s*\S+/gi, label: 'Password' },
];

const MEDICAL_TERMS = [
  'diagnosed with', 'hiv', 'cancer', 'diabetes', 'depression',
  'anxiety disorder', 'hypertension', 'tuberculosis', 'hepatitis',
  'insulin', 'chemotherapy', 'mental health', 'psychiatric', 'prescription'
];

function analyzeText(text) {
  const findings = [];
  for (const p of PATTERNS) {
    const clone = new RegExp(p.regex.source, p.regex.flags);
    const matches = [...text.matchAll(clone)];
    matches.forEach(m => {
      findings.push({ id: p.id, category: p.category, severity: p.severity, label: p.label, match: m[0], index: m.index });
    });
  }
  const lower = text.toLowerCase();
  MEDICAL_TERMS.forEach(term => {
    const idx = lower.indexOf(term);
    if (idx !== -1) findings.push({ id: 'medical', category: 'Medical', severity: 'High', label: 'Medical Information', match: term, index: idx });
  });

  const weights = { High: 25, Medium: 10, Low: 3 };
  const riskScore = Math.min(100, findings.reduce((a, f) => a + (weights[f.severity] || 0), 0));
  return { findings, riskScore };
}

function redactText(text, findings, style) {
  let result = text;
  const sorted = [...findings].sort((a, b) => b.index - a.index);
  sorted.forEach(f => {
    let r;
    if (style === 'placeholder') r = `[${f.label.toUpperCase().replace(/ /g, '_')}]`;
    else if (style === 'generic') r = getGeneric(f.id);
    else r = '█'.repeat(Math.min(f.match.length, 20));
    result = result.slice(0, f.index) + r + result.slice(f.index + f.match.length);
  });
  return result;
}

function getGeneric(id) {
  const map = { credit_card: '4000-XXXX-XXXX-XXXX', email: 'user@example.com', phone: '+91-XXXXX-XXXXX', api_key: '[API_KEY_REDACTED]', password: '[PASSWORD_REDACTED]', ssn: 'XXX-XX-XXXX', aadhaar: 'XXXX XXXX XXXX' };
  return map[id] || '[REDACTED]';
}

module.exports = { analyzeText, redactText };
