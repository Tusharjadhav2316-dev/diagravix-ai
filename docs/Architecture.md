# Diagravix AI Architecture

## Current State

The current project is a prototype with:

- Next.js app routes.
- A separate FastAPI backend using Groq.
- Konva-based canvas rendering.
- Local rule-based NLP generation.
- Multiple incompatible diagram data shapes.
- Export helpers with inconsistent contracts.
- Build configured to ignore TypeScript errors.

## Target Architecture

```txt
User Interface
  -> API Routes
  -> AI Service Layer
  -> Zod Validation
  -> Canonical Diagram Schema
  -> Auto Layout Engine
  -> React Flow Renderer
  -> Firebase Persistence
  -> Export/Share
```

## Folder Structure

```txt
app/
  editor/
  dashboard/
  diagrams/[id]/
  share/[id]/
  api/
components/
  ui/
  layout/
  marketing/
features/
  diagram/
  editor/
  templates/
  auth/
lib/
  ai/
  diagram/
  firebase/
  rate-limit/
  seo/
services/
  diagram-service.ts
  ai-service.ts
  template-service.ts
stores/
  editor-store.ts
types/
  diagram.ts
docs/
```

## Boundaries

- UI components render state and call hooks.
- Feature modules own product behavior.
- Services own data access and API logic.
- Zod schemas define validation.
- React Flow receives already-valid diagram data.
- AI service never imports React or renderer code.

## Migration Strategy

1. Add canonical schema.
2. Add React Flow editor alongside existing Konva code.
3. Connect generation output to schema and layout.
4. Replace old editor routes.
5. Remove obsolete Konva canvas after parity.
