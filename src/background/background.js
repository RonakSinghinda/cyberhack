// background.js - SafeSearch AI background service worker
console.log("SafeSearch AI: Background service worker initialized.");


// --- Regex Pattern Definitions ---
const PATTERNS = [
    {
        id: "credit_card",
        category: "Financial",
        severity: "High",
        regex: /(?<![0-9])(?:4[0-9]{15}|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})(?![0-9])/g,
        description: "Credit Card Number"
    },
    {
        id: "ssn",
        category: "PII",
        severity: "High",
        regex: /\b(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/g,
        description: "Social Security Number"
    },
    {
        id: "aadhaar",
        category: "PII",
        severity: "High",
        regex: /\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b/g,
        description: "Aadhaar Number"
    },
    {
        id: "email",
        category: "Contact",
        severity: "Medium",
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
        description: "Email Address"
    },
    {
        id: "phone",
        category: "Contact",
        severity: "Low",
        regex: /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g,
        description: "Phone Number"
    },
    {
        id: "api_key",
        category: "Credentials",
        severity: "High",
        regex: /\b[A-Za-z0-9_-]{32,}\b/g,
        description: "Possible API Key or Token"
    }
];

function analyzeQuery(query) {
    const findings = [];
    let maxSeverity = "None";

    for (const pattern of PATTERNS) {
        const matches = [...query.matchAll(pattern.regex)];
        if (matches.length > 0) {
            const matchedStrings = matches.map(m => m[0]);
            findings.push({
                type: pattern.id,
                category: pattern.category,
                severity: pattern.severity,
                description: pattern.description,
                matches: matchedStrings
            });
            
            if (pattern.severity === "High") maxSeverity = "High";
            else if (pattern.severity === "Medium" && maxSeverity !== "High") maxSeverity = "Medium";
            else if (pattern.severity === "Low" && maxSeverity === "None") maxSeverity = "Low";
        }
    }

    return {
        isSensitive: findings.length > 0,
        findings: findings,
        maxSeverity: maxSeverity
    };
}

// --- NLP Definitions ---
const VOCABULARY = {
    medical: [
        { word: "symptoms", weight: 0.5 },
        { word: "diagnosis", weight: 0.6 },
        { word: "treatment", weight: 0.5 },
        { word: "cancer", weight: 0.8 },
        { word: "hiv", weight: 0.9 },
        { word: "depression", weight: 0.7 },
        { word: "pregnancy", weight: 0.6 },
        { word: "test results", weight: 0.8 },
        { word: "std", weight: 0.9 }
    ],
    financial: [
        { word: "bank account", weight: 0.8 },
        { word: "routing number", weight: 0.9 },
        { word: "password", weight: 0.9 },
        { word: "cvv", weight: 0.9 },
        { word: "pin number", weight: 0.9 },
        { word: "balance", weight: 0.4 },
        { word: "wire transfer", weight: 0.7 }
    ],
    personal: [
        { word: "passport", weight: 0.8 },
        { word: "driver license", weight: 0.8 },
        { word: "address", weight: 0.4 },
        { word: "date of birth", weight: 0.8 },
        { word: "dob", weight: 0.7 }
    ]
};

const THRESHOLD_HIGH = 1.5;
const THRESHOLD_MEDIUM = 0.8;

function nlpClassify(query) {
    const lowerQuery = query.toLowerCase();
    let scores = { medical: 0, financial: 0, personal: 0 };
    let findings = [];

    for (const [category, terms] of Object.entries(VOCABULARY)) {
        for (const term of terms) {
            if (lowerQuery.includes(term.word)) {
                scores[category] += term.weight;
                findings.push({
                    type: 'nlp_intent',
                    category: category.charAt(0).toUpperCase() + category.slice(1),
                    trigger: term.word
                });
            }
        }
    }

    let maxScore = Math.max(scores.medical, scores.financial, scores.personal);
    let severity = "None";
    
    if (maxScore >= THRESHOLD_HIGH) {
        severity = "High";
    } else if (maxScore >= THRESHOLD_MEDIUM) {
        severity = "Medium";
    } else if (maxScore > 0) {
        severity = "Low";
    }

    return {
        isSensitive: severity !== "None",
        findings: findings,
        maxSeverity: severity
    };
}

// --- Message Handlers ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'QUERY_INTERCEPTED') {
        const query = request.payload;
        
        chrome.storage.local.get({ sensitivity: 'medium' }, (settings) => {
            const patternResult = analyzeQuery(query);
            const nlpResult = nlpClassify(query);
            
            const combinedFindings = [...patternResult.findings, ...nlpResult.findings];
            
            let finalSeverity = "None";
            const severities = [patternResult.maxSeverity, nlpResult.maxSeverity];
            if (severities.includes("High")) finalSeverity = "High";
            else if (severities.includes("Medium")) finalSeverity = "Medium";
            else if (severities.includes("Low")) finalSeverity = "Low";

            let shouldAlert = false;
            if (settings.sensitivity === 'high' && finalSeverity !== "None") shouldAlert = true;
            if (settings.sensitivity === 'medium' && (finalSeverity === "High" || finalSeverity === "Medium")) shouldAlert = true;
            if (settings.sensitivity === 'low' && finalSeverity === "High") shouldAlert = true;

            const analysisResult = {
                isSensitive: shouldAlert,
                findings: combinedFindings,
                maxSeverity: finalSeverity
            };
            
            sendResponse({ 
                status: "analyzed", 
                risk: shouldAlert ? analysisResult.maxSeverity : "None",
                analysis: analysisResult
            });
        });
        return true; // async callback support
    } 
    else if (request.type === 'LOG_EVENT') {
        const event = request.payload;
        event.event_id = 'evt_' + Math.random().toString(36).substr(2, 9);
        
        chrome.storage.local.get({ events: [], redactedCount: 0, alertCount: 0 }, (data) => {
            const events = data.events;
            events.unshift(event);
            if (events.length > 50) events.pop();
            
            let newRedactedCount = data.redactedCount;
            let newAlertCount = data.alertCount + 1;
            
            if (event.action_taken === "Redacted") {
                newRedactedCount++;
            }
            
            chrome.storage.local.set({ 
                events: events,
                redactedCount: newRedactedCount,
                alertCount: newAlertCount
            });
        });
        sendResponse({ status: 'logged' });
    }
    return true; 
});
