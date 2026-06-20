// ============================================================
// SafeSearch AI - content.js  v3.0  (Clean Rebuild)
// Injected into: Google, Bing, DuckDuckGo, ChatGPT, Claude, Gemini
// ============================================================

console.log('[SafeSearch AI] Loaded on:', location.hostname);

// ── State ────────────────────────────────────────────────────
let lastText      = '';
let bannerEl      = null;
let debounceId    = null;
let observers     = [];   // active MutationObservers

// ── 1. Safe Chrome Messaging ─────────────────────────────────
//
// WHY DOUBLE TRY-CATCH:
//   Outer catch  → extension was already invalidated when sendMessage is called (sync throw)
//   Inner catch  → extension got invalidated while waiting for the async response callback
//
function sendToBackground(msg, cb) {
    try {
        chrome.runtime.sendMessage(msg, function(response) {
            try {
                if (chrome.runtime.lastError) return; // consume to prevent Chrome error
                if (cb && response) cb(response);
            } catch (e) { /* context gone during async response */ }
        });
    } catch (e) { /* context gone before sendMessage */ }
}

// ── 2. Text helpers ──────────────────────────────────────────
function readText(el) {
    if (!el) return '';
    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
        return (el.innerText || el.textContent || '').trim();
    }
    return (el.value || '').trim();
}

function writeText(el, text) {
    if (!el) return;
    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
        el.focus();
        // Use execCommand so React/ProseMirror picks up the change
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
    } else {
        // React-friendly setter for controlled <input>/<textarea>
        const proto = el.tagName === 'TEXTAREA'
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value');
        if (setter) setter.set.call(el, text);
        else el.value = text;
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

// ── 3. Banner ────────────────────────────────────────────────
function closeBanner() {
    if (bannerEl) { bannerEl.remove(); bannerEl = null; }
}

function buildSafeText(original, findings) {
    if (!Array.isArray(findings)) return original;
    let safe = original;
    findings.forEach(function(f) {
        try {
            if (Array.isArray(f.matches)) {
                f.matches.forEach(function(m) {
                    if (m) safe = safe.split(m).join('[REDACTED]');
                });
            }
            if (f.type === 'nlp_intent' && typeof f.trigger === 'string') {
                safe = safe.replace(new RegExp(f.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '[SENSITIVE]');
            }
        } catch (e) {}
    });
    return safe;
}

function showBanner(inputEl, analysis, originalText) {
    closeBanner();

    if (!analysis || !Array.isArray(analysis.findings)) return;

    const safe       = buildSafeText(originalText, analysis.findings);
    const hasChanges = safe !== originalText;
    const cats       = [...new Set(analysis.findings.map(function(f) { return f.category || ''; }))].filter(Boolean).join(', ') || 'Sensitive Data';
    const severity   = analysis.maxSeverity || 'High';

    // --- Smart positioning: prefer ABOVE the input when space below is tight ---
    const rect       = inputEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const bannerH    = Math.min(360, window.innerHeight * 0.65); // max banner height
    const w          = Math.min(Math.max(360, rect.width), window.innerWidth - 16);
    const left       = Math.max(Math.min(rect.left, window.innerWidth - w - 8), 8);

    // Place above if there's more room, or if below doesn't fit
    var topVal;
    if (spaceBelow >= bannerH || spaceBelow >= spaceAbove) {
        topVal = rect.bottom + 8;  // below input
    } else {
        topVal = rect.top - bannerH - 8;  // above input
    }
    topVal = Math.max(8, Math.min(topVal, window.innerHeight - bannerH - 8));

    bannerEl = document.createElement('div');
    bannerEl.id = 'safesearch-banner';
    // Outer container: fixed height, flex column so buttons stay at bottom
    bannerEl.style.cssText =
        'position:fixed!important;' +
        'z-index:2147483647!important;' +
        'top:'    + topVal + 'px;' +
        'left:'   + left   + 'px;' +
        'width:'  + w      + 'px;' +
        'max-height:' + bannerH + 'px;' +
        'background:rgba(10,14,28,0.97);' +
        'border:1.5px solid rgba(239,68,68,0.6);' +
        'border-radius:14px;' +
        'box-shadow:0 24px 48px rgba(0,0,0,0.8);' +
        'backdrop-filter:blur(20px);' +
        'font-family:system-ui,-apple-system,sans-serif;' +
        'font-size:13px;color:#f8fafc;' +
        'display:flex;flex-direction:column;' + // flex column so buttons stick to bottom
        'box-sizing:border-box;overflow:hidden;';

    bannerEl.innerHTML =
        // --- TOP SECTION: header + description (fixed, no scroll) ---
        '<div style="padding:16px 18px 0;flex-shrink:0">' +
            '<div style="display:flex;align-items:center;gap:10px;font-weight:700;font-size:14px;color:#f87171;letter-spacing:.4px;margin-bottom:10px">' +
                '<span style="font-size:18px">🛡️</span>' +
                'SafeSearch AI &mdash; ' + escHtml(severity) + ' Risk' +
            '</div>' +
            '<div style="color:#cbd5e1;line-height:1.5;font-size:13px">' +
                'Detected: <strong style="color:#fbbf24">' + escHtml(cats) + '</strong><br>' +
                'Do not submit sensitive data to AI services or search engines.' +
            '</div>' +
        '</div>' +

        // --- MIDDLE SECTION: safe version (scrollable) ---
        (hasChanges
            ? '<div style="' +
              'flex:1;overflow-y:auto;' +
              'margin:10px 18px;' +
              'background:rgba(15,23,42,.8);' +
              'border:1px dashed rgba(96,165,250,.4);' +
              'border-radius:8px;padding:10px;' +
              'font-family:monospace;font-size:11.5px;color:#93c5fd;' +
              'word-break:break-all;line-height:1.6;' +
              'min-height:40px;' + // always show at least a bit
              '">' +
              '<strong style="display:block;margin-bottom:4px;color:#60a5fa;font-size:11px;letter-spacing:.5px;text-transform:uppercase">Safe version (scroll to see all):</strong>' +
              escHtml(safe) +
              '</div>'
            : '<div style="flex:1"></div>') +

        // --- BOTTOM SECTION: buttons (always visible, never cut off) ---
        '<div style="' +
            'display:flex;gap:8px;flex-wrap:wrap;' +
            'padding:12px 18px 16px;' +
            'border-top:1px solid rgba(255,255,255,0.06);' +
            'flex-shrink:0;background:rgba(10,14,28,0.5);' +
            'border-radius:0 0 13px 13px;' +
        '">' +
            (hasChanges
                ? '<button id="ss-accept" style="flex:1;min-width:90px;padding:9px 12px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:none;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer">✓ Use Safe Version</button>'
                : '') +
            '<button id="ss-proceed" style="flex:1;min-width:90px;padding:9px 12px;background:rgba(255,255,255,.08);color:#e2e8f0;border:1px solid rgba(255,255,255,.15);border-radius:8px;font-weight:600;font-size:12px;cursor:pointer">Proceed Anyway</button>' +
            '<button id="ss-clear" style="flex:1;min-width:90px;padding:9px 12px;background:rgba(239,68,68,.15);color:#fca5a5;border:1px solid rgba(239,68,68,.3);border-radius:8px;font-weight:600;font-size:12px;cursor:pointer">✕ Clear</button>' +
        '</div>';

    document.body.appendChild(bannerEl);

    // Button handlers — all wrapped in try-catch
    var btnAccept  = bannerEl.querySelector('#ss-accept');
    var btnProceed = bannerEl.querySelector('#ss-proceed');
    var btnClear   = bannerEl.querySelector('#ss-clear');

    function logAndClose(action) {
        try { lastText = ''; } catch(e) {}
        sendToBackground({ type: 'LOG_EVENT', payload: { timestamp: new Date().toISOString(), risk_category: cats, severity: severity, action_taken: action } });
        closeBanner();
    }

    if (btnAccept) {
        btnAccept.addEventListener('click', function(e) {
            try { e.preventDefault(); e.stopPropagation(); writeText(inputEl, safe); logAndClose('Redacted'); } catch(e) {}
        });
    }
    btnProceed.addEventListener('click', function(e) {
        try { e.preventDefault(); e.stopPropagation(); logAndClose('Proceeded'); } catch(e) {}
    });
    btnClear.addEventListener('click', function(e) {
        try { e.preventDefault(); e.stopPropagation(); writeText(inputEl, ''); logAndClose('Dismissed'); } catch(e) {}
    });
}

function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── 4. Core Scan Logic ───────────────────────────────────────
function scan(inputEl) {
    var text = readText(inputEl);

    // Reset tracker when input is empty so re-pasting same text works
    if (!text || text.length < 3) {
        lastText = '';
        closeBanner();
        return;
    }

    if (text === lastText) return; // unchanged — skip
    lastText = text;

    clearTimeout(debounceId);
    debounceId = setTimeout(function() {
        console.log('[SafeSearch AI] Analyzing:', text.substring(0, 60));
        sendToBackground({ type: 'QUERY_INTERCEPTED', payload: text }, function(response) {
            if (response && response.risk && response.risk !== 'None') {
                console.log('[SafeSearch AI] Risk:', response.risk);
                showBanner(inputEl, response.analysis, text);
            }
        });
    }, 500);
}

// ── 5. Input Element Finder ──────────────────────────────────
function isInsideBanner(el) {
    return el && bannerEl && bannerEl.contains(el);
}

function findHost(el) {
    if (!el || isInsideBanner(el)) return null;
    var curr = el;
    while (curr && curr !== document.body) {
        // Standard inputs
        if (curr.tagName === 'TEXTAREA' || curr.tagName === 'INPUT') return curr;
        // Contenteditable (ChatGPT, Claude, Gemini)
        if (curr.isContentEditable || curr.getAttribute('contenteditable') === 'true') {
            // Walk up to find the topmost contenteditable container
            while (curr.parentElement &&
                   (curr.parentElement.isContentEditable || curr.parentElement.getAttribute('contenteditable') === 'true')) {
                curr = curr.parentElement;
            }
            if (isInsideBanner(curr)) return null;
            return curr;
        }
        curr = curr.parentElement;
    }
    return null;
}

// ── 6A. Layer 1: MutationObserver (most reliable for React/ProseMirror) ───────
//
// Watch known contenteditable elements directly. When their text changes,
// MutationObserver fires immediately — no polling delay, no event blocking.
//
var WATCH_SELECTORS = [
    '#prompt-textarea',                          // ChatGPT
    '[contenteditable="true"][data-placeholder]',// Claude  
    '.ql-editor[contenteditable]',               // Gemini
    'rich-textarea [contenteditable]',           // Gemini alt
    '[role="textbox"][contenteditable]'          // Generic
];

function attachObserver(el) {
    if (!el || el._ssObserved) return;
    el._ssObserved = true;

    var obs = new MutationObserver(function() {
        try { scan(el); } catch(e) {}
    });
    obs.observe(el, { childList: true, subtree: true, characterData: true });
    observers.push(obs);
    console.log('[SafeSearch AI] MutationObserver attached to:', el.id || el.className.substring(0,30));
}

function attachKnownElements() {
    WATCH_SELECTORS.forEach(function(sel) {
        try {
            document.querySelectorAll(sel).forEach(function(el) {
                attachObserver(el);
            });
        } catch(e) {}
    });
}

// Watch for new elements added to DOM (ChatGPT creates its textarea dynamically)
var domWatcher = new MutationObserver(function() {
    try { attachKnownElements(); } catch(e) {}
});
domWatcher.observe(document.documentElement, { childList: true, subtree: true });

// Initial attach attempt
attachKnownElements();

// ── 6B. Layer 2: Native input events (Google, Bing, DuckDuckGo) ──────────────
document.addEventListener('input', function(e) {
    try {
        var host = findHost(e.target);
        if (host) scan(host);
    } catch(e) {}
}, true);

document.addEventListener('paste', function(e) {
    try {
        var host = findHost(e.target);
        if (!host) return;
        // Paste text not yet reflected in DOM — wait one frame
        setTimeout(function() {
            try { scan(host); } catch(e) {}
        }, 50);
    } catch(e) {}
}, true);

// ── 6C. Layer 3: Polling fallback (catches anything missed above) ─────────────
setInterval(function() {
    try {
        var host = findHost(document.activeElement);
        if (host) scan(host);
    } catch(e) {}
}, 800);

// ── 7. Block Enter while banner is visible ───────────────────
document.addEventListener('keydown', function(e) {
    try {
        if (e.key === 'Enter' && bannerEl) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    } catch(e) {}
}, true);

// ── 8. Click outside banner closes it ───────────────────────
document.addEventListener('click', function(e) {
    try {
        if (bannerEl && !bannerEl.contains(e.target)) closeBanner();
    } catch(e) {}
}, true);

console.log('[SafeSearch AI] All 3 detection layers active. Ready.');
