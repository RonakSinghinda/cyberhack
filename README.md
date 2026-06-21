# DataShield AI Ecosystem

A dual-module privacy platform designed to prevent the accidental exposure of sensitive data during real-time searching and content sharing.

---

## 🛠 Project Structure

The repository is divided into two completely independent architectural modules:

### 1. Browser Extension (`/`)
**Real-time Search Query Protection**
*   **Purpose:** Intercepts search queries on major engines (Google, etc.) to flag PII or financial data before it hits the server.
*   **Tech Stack:** Manifest V3, Vanilla JavaScript, Shadow DOM Interception.
*   **Privacy:** 100% client-side. Zero data egress.
*   **Features:**
    *   Recursive Shadow DOM traversal to hook into modern SPA search inputs.
    *   Hybrid Regex + NLP detection engine.
    *   Non-intrusive UI banners injected via CSS/JS.

### 2. Web Application (`/webapp`)
**Enterprise-Grade Pre-Share Content Scanner**
*   **Purpose:** A dedicated platform for deep-scanning documents and messages before they are shared via email, chat, or reports.
*   **Tech Stack:**
    *   **Frontend:** React 18, Vite, Recharts, Lucide.
    *   **Backend:** Node.js, Express.
    *   **Database:** MongoDB (User metadata & scan logs).
*   **Features:**
    *   **Secure Auth:** JWT-based user accounts with persistent sessions.
    *   **Multi-Format Parsing:** PDF, DOCX, and TXT support.
    *   **AI OCR:** Image-based scanning (PNG/JPG) using Tesseract.js.
    *   **Redaction Studio:** 3-step workflow (Detect → Select → Mask) with multiple styles.
    *   **Risk Dashboard:** Visual analytics of sharing safety trends.
    *   **Personalization:** Custom blocklists and sensitivity controls.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Running locally on `localhost:27017`)
*   Google Chrome (for the Extension)

### Loading the Extension
1.  Open Chrome and navigate to `chrome://extensions/`
2.  Enable **Developer Mode** (top right).
3.  Click **Load Unpacked** and select the root directory of this project.

### Running the Web App
1.  Navigate to the webapp directory: `cd webapp`
2.  **Start Backend:**
    ```bash
    cd backend
    npm install
    npm run dev  # Runs on http://localhost:5000
    ```
3.  **Start Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev  # Runs on http://localhost:5173
    ```

---

## 🛡 Privacy & Security
*   **Isolation:** The Extension and Web App share zero code or storage.
*   **Data Minimization:** We never store raw file content or the actual text flagged. Only anonymized metadata (e.g., "3 PII items found") is saved to the database for history tracking.
*   **Local Processing:** All detection logic runs within your specific session environment.

---

## ⚖ License
MIT License - Developed for Advanced Agentic Coding.
