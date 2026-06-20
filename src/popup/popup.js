// popup.js - Controller for extension settings popup dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log("SafeSearch AI Popup: Controller initialized.");

    // Elements
    const tabDashboard = document.getElementById('tab-dashboard');
    const tabLogs = document.getElementById('tab-logs');
    const panelDashboard = document.getElementById('view-dashboard-panel');
    const panelLogs = document.getElementById('view-logs-panel');

    const statAlerts = document.getElementById('stat-alerts');
    const statRedacted = document.getElementById('stat-redacted');

    const sensitivitySlider = document.getElementById('sensitivity-slider');
    const levelBadge = document.getElementById('level-badge');
    const sliderLabels = document.querySelectorAll('.slider-labels span');

    const logsContainer = document.getElementById('logs-container');
    const clearLogsBtn = document.getElementById('clearLogsBtn');

    // Mappings
    const valToSensitivity = {
        '1': 'low',
        '2': 'medium',
        '3': 'high'
    };
    const sensitivityToVal = {
        'low': '1',
        'medium': '2',
        'high': '3'
    };
    const sensitivityLabels = {
        'low': 'Relaxed',
        'medium': 'Balanced',
        'high': 'Paranoid'
    };

    // --- Tab Interactivity ---
    tabDashboard.addEventListener('click', () => {
        tabDashboard.classList.add('active');
        tabLogs.classList.remove('active');
        panelDashboard.classList.remove('hidden');
        panelLogs.classList.add('hidden');
    });

    tabLogs.addEventListener('click', () => {
        tabLogs.classList.add('active');
        tabDashboard.classList.remove('active');
        panelLogs.classList.remove('hidden');
        panelDashboard.classList.add('hidden');
        loadLogs(); // Refresh logs on tab switch
    });

    // --- Core Operations & Data Binding ---
    function loadDashboardData() {
        chrome.storage.local.get(['sensitivity', 'alertCount', 'redactedCount'], (result) => {
            // Set counts
            statAlerts.textContent = result.alertCount || 0;
            statRedacted.textContent = result.redactedCount || 0;

            // Map sensitivity to slider position
            const sensitivity = result.sensitivity || 'medium';
            const sliderVal = sensitivityToVal[sensitivity];
            sensitivitySlider.value = sliderVal;
            updateSliderUI(sliderVal, sensitivity);
        });
    }

    function updateSliderUI(val, sensitivity) {
        levelBadge.textContent = sensitivityLabels[sensitivity];
        
        // Highlight active text label
        sliderLabels.forEach(label => label.classList.remove('active'));
        if (val === '1') document.querySelector('.label-low').classList.add('active');
        if (val === '2') document.querySelector('.label-medium').classList.add('active');
        if (val === '3') document.querySelector('.label-high').classList.add('active');
    }

    // Handle range slider updates
    sensitivitySlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const sensitivity = valToSensitivity[val];
        updateSliderUI(val, sensitivity);
        
        chrome.storage.local.set({ sensitivity: sensitivity }, () => {
            console.log(`Compliance setting updated to: ${sensitivity}`);
        });
    });

    // Load logs list
    function loadLogs() {
        chrome.storage.local.get({ events: [] }, (data) => {
            if (data.events.length === 0) {
                logsContainer.innerHTML = `<p style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 20px;">No events recorded.</p>`;
                return;
            }

            logsContainer.innerHTML = data.events.map(event => {
                const formattedTime = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `
                    <div class="log-entry">
                        <div class="log-entry-meta">
                            <span class="log-entry-action">${escapeHtml(event.action_taken)}</span>
                            <span class="log-entry-time">${formattedTime}</span>
                        </div>
                        <div class="log-entry-detail">${escapeHtml(event.risk_category)} (${escapeHtml(event.severity)})</div>
                    </div>
                `;
            }).join('');
        });
    }

    // Clear history logs
    clearLogsBtn.addEventListener('click', () => {
        chrome.storage.local.set({ events: [], alertCount: 0, redactedCount: 0 }, () => {
            loadDashboardData();
            loadLogs();
            console.log("Logs cleared successfully.");
        });
    });

    // Helper to sanitize HTML injection
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initialize Dashboard
    loadDashboardData();
});
