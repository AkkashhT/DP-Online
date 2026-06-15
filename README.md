# Document Processor

AI-powered document processing app. Upload a PDF, JPG, or PNG — Gemini extracts text, tables, and images. Edit results inline, download outputs, and chat with your document.

---

## Quick Start

### Requirements
- Python 3.9+
- Node.js 16+
- Gemini API key → https://aistudio.google.com/app/apikey

---

### 1. Backend Setup

```bash
cd document-processor/backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Gemini API Key

**Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY="AIzaSy...your_key_here"
```

**Mac/Linux:**
```bash
export GEMINI_API_KEY="AIzaSy...your_key_here"
```

### 3. Start Backend
```bash
python app.py
# → Running on http://127.0.0.1:5000
# → Database initialised at ...documents.db
```

### 4. Frontend Setup (new terminal)
```bash
cd document-processor/frontend
npm install
npm start
# → Opens http://localhost:3000
```

---

## Features

| Feature | Description |
|---|---|
| Upload | PDF, JPG, PNG drag & drop |
| Extract Text | Full text via Gemini AI |
| Extract Tables | Rendered as HTML, download as .xlsx |
| Extract Images | Embedded images as PNG files |
| **Edit Text** | Click "Edit Text" to correct extraction |
| **Edit Tables** | Click any cell to edit inline, add/delete rows & columns |
| Chat | Ask questions, answered by Gemini from document content |
| History | All documents stored in SQLite, reload anytime |
| Downloads | .txt, .xlsx, individual .png — reflect edited content |

---

## Project Structure

```
document-processor/
├── backend/
│   ├── app.py           Flask API + Gemini integration
│   ├── database.py      SQLite helpers
│   ├── requirements.txt Python dependencies
│   └── .env.example     API key template
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── index.css
        ├── components/
        │   └── Sidebar.js
        └── pages/
            ├── UploadPage.js
            ├── ResultsPage.js   ← includes inline editing
            ├── ChatPage.js
            └── HistoryPage.js
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/upload | Upload & process document |
| GET | /api/documents | List all documents |
| GET | /api/documents/:id | Get document + results |
| DELETE | /api/documents/:id | Delete document |
| PUT | /api/edit/text/:id | Save edited text |
| PUT | /api/edit/tables/:id | Save edited tables |
| GET | /api/download/text/:id | Download .txt |
| GET | /api/download/tables/:id | Download .xlsx |
| GET | /api/download/image/:id/:imgId | Download image |
| POST | /api/chat/:id | Chat with document |
| GET | /api/health | Health check |

---

## Troubleshooting

**"Gemini API key not configured"**
→ Make sure you set `$env:GEMINI_API_KEY` before running `python app.py`

**"429 RESOURCE_EXHAUSTED"**  
→ Free tier rate limit hit. Wait 60 seconds and try again. The app uses `gemini-1.5-flash`.

**`ModuleNotFoundError`**  
→ Run `pip install -r requirements.txt` with your venv activated.

**Frontend won't connect to backend**  
→ Make sure backend is running on port 5000. The `"proxy"` in package.json handles this.

**Key starts with `AQ.`**  
→ That's an OAuth token, not an API key. Get the correct key at https://aistudio.google.com/app/apikey — it starts with `AIzaSy`.
