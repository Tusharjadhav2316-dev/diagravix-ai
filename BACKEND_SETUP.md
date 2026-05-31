# AI Diagram Generator - Backend Setup Guide

## Prerequisites
- Python 3.9+
- pip

## Installation

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variable
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Start the Backend Server
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### 4. In Another Terminal, Start Frontend
\`\`\`bash
npm run dev
\`\`\`

Frontend will run on `http://localhost:3000`

## How to Use

1. Go to http://localhost:3000
2. Describe your diagram (e.g., "User logs in, system validates credentials, if valid show dashboard")
3. Select diagram type from dropdown
4. Click "Generate Diagram"
5. Watch the AI generate your diagram automatically!
6. Drag nodes to reposition, edit labels, export as PNG or Mermaid

## Troubleshooting

**"Failed to generate diagram" error:**
- Make sure backend is running on localhost:8000
- Check that GEMINI_API_KEY is set correctly
- Verify Python dependencies are installed

**Blank canvas:**
- Backend is not running
- Follow steps 1-3 above
