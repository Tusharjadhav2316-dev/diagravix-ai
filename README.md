# AI-Powered Intelligent Diagram Generator

A full-stack application that converts natural language descriptions into interactive diagrams using Gemini AI.

## Features

- **AI-Powered Generation**: Uses Gemini 2.5 Flash to intelligently extract entities and relationships from text
- **Interactive Canvas**: Konva.js-based canvas for smooth dragging, zooming, and real-time editing
- **Multiple Diagram Types**: Supports Flowcharts, UML Class Diagrams, Entity-Relationship, Sequence, and Mind Maps
- **Multi-Format Export**: Export to PNG, SVG, PDF, Mermaid, PlantUML, or JSON
- **Manual Editing**: Full interactive editing capabilities for generated or manually created diagrams

## Architecture

### Frontend (Next.js)
- `app/editor/page.tsx` - Main editor interface
- `components/` - React components for editor, canvas, panels
- `lib/export/` - Export functionality for multiple formats
- `lib/api-client.ts` - API communication

### Backend (FastAPI + Python)
- `backend/main.py` - FastAPI server with Gemini integration
- Endpoints for diagram generation and enhancement
- Intelligent NLP processing and layout generation

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Gemini API Key

### Installation

1. **Setup Backend**
   \`\`\`bash
   cd backend
   pip install -r requirements.txt
   export GEMINI_API_KEY=your_key_here
   bash run.sh
   \`\`\`

2. **Setup Frontend**
   \`\`\`bash
   npm install
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   npm run dev
   \`\`\`

3. **Access the app**
   - Navigate to http://localhost:3000/editor

## Usage

1. **Generate from Text**
   - Click "AI Generate" mode
   - Enter a description of your diagram
   - Select diagram type
   - Click "Generate Diagram"

2. **Manual Editing**
   - Click "Manual Draw" mode
   - Click shapes to add nodes
   - Drag nodes to reposition
   - Use properties panel to edit labels
   - Click and drag between nodes to create connections

3. **Export**
   - Click "Export" button
   - Choose desired format
   - File downloads automatically

## Supported Export Formats

- **Images**: PNG, SVG, PDF
- **Code**: Mermaid, PlantUML
- **Data**: JSON

## API Endpoints

### Generate Diagram
\`\`\`
POST /api/generate-diagram
Request: { "text": "description", "diagram_type": "flowchart" }
Response: Diagram data with nodes and edges
\`\`\`

### Enhance Diagram
\`\`\`
POST /api/enhance-diagram
Request: Existing diagram data
Response: AI suggestions for improvement
\`\`\`

### Health Check
\`\`\`
GET /health
Response: Service status
\`\`\`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| GEMINI_API_KEY | Your Gemini API key | AIzaSy... |
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:8000 |

## Project Structure

\`\`\`
├── app/
│   ├── editor/page.tsx
│   ├── page.tsx
│   └── api/diagram/
├── components/
│   ├── diagram-editor.tsx
│   ├── editor-canvas.tsx
│   ├── generation-panel.tsx
│   ├── export-menu.tsx
│   └── properties-panel.tsx
├── lib/
│   ├── api-client.ts
│   ├── diagram-generator.ts
│   ├── export/
│   └── nlp/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── run.sh
└── public/
