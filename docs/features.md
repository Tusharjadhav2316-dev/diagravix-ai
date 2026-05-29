# Diagravix AI Features

## Phase 1 Features

### 1. AI Diagram Generation

- Accept a natural language prompt.
- Support diagram types: flowchart, UML class, ER, sequence, mind map, architecture, generic.
- Return one canonical diagram JSON shape.
- Validate all AI output before rendering.
- Recover gracefully from invalid JSON.

### 2. React Flow Editor

- Render custom nodes and edges.
- Drag nodes.
- Connect nodes.
- Edit node labels and types.
- Delete selected nodes and edges.
- Multi-select diagram elements.
- Zoom, pan, minimap, fit view.
- Undo and redo.
- Keyboard shortcuts.

### 3. Templates

- Provide starter templates for common diagram types.
- Templates use the same canonical schema as AI-generated diagrams.
- Users can open a template and edit immediately.

### 4. Save And History

- Anonymous users can generate limited diagrams but cannot persist full history.
- Authenticated users can save diagrams.
- Dashboard shows recent diagrams.
- Autosave updates current diagrams after edit debounce.

### 5. Export

- Phase 1: PNG and JSON.
- Phase 2: SVG, PDF, Mermaid, PlantUML.
- Exports preserve node positions and visible layout.

### 6. Share

- Users can create a read-only public share URL.
- Private diagrams stay accessible only to the owner.
- Shared pages load fast and are optimized for viewing.

### 7. Feedback

- Users can submit generation quality feedback.
- Feedback records prompt, diagram type, rating, and optional message.

### 8. SEO Website

- Landing page with live product preview.
- SEO pages for high-intent diagram generator terms.
- Sitemap, robots, Open Graph, and structured data.

## Phase 2 Features

- Billing and usage plans.
- Collaboration and comments.
- Diagram version history.
- Team workspaces.
- Advanced AI enhancement and redesign suggestions.
- Template marketplace.
- More export formats.
