# Diagravix AI PRD

## Product Summary

Diagravix AI is an AI-powered diagram generation and editing SaaS. Users describe a system, workflow, data model, or idea in plain English, then receive a structured, editable, exportable diagram.

Tagline: "Turn ideas into production-ready diagrams in seconds."

## Target Users

- Software engineers creating architecture, flow, sequence, and UML diagrams.
- Product managers converting workflows and specs into visuals.
- Founders and teams preparing pitch, planning, and documentation diagrams.
- Students and educators explaining technical systems visually.
- Documentation writers producing diagrams for README, docs, and internal wikis.

## Core User Flow

1. User enters a diagram prompt.
2. AI service returns strict diagram JSON.
3. Zod validation accepts, repairs, or rejects the result.
4. Auto-layout positions nodes and edges.
5. React Flow renders the diagram.
6. User edits labels, nodes, connections, layout, and style.
7. User saves, exports, or shares the diagram.

## MVP Features

- AI diagram generation from text.
- React Flow-based editor.
- Canonical diagram schema.
- Diagram validation and fallback recovery.
- Manual editing: drag, connect, select, delete, edit labels.
- Templates for major diagram types.
- Firebase Auth with Google and email/password.
- Firestore save/load/history.
- PNG and JSON export.
- Shareable read-only diagram pages.
- SEO landing pages for high-intent keywords.

## Success Metrics

- First generated diagram appears in under 8 seconds for normal prompts.
- Editor remains smooth for diagrams with 50 nodes and 80 edges.
- Production build passes without ignored TypeScript errors.
- Anonymous users can generate a limited diagram.
- Authenticated users can save, reload, export, and share.
- Core SEO pages are index-ready with metadata, sitemap, and robots.

## Non-Goals For Phase 1

- Real-time collaboration.
- Billing and paid plans.
- Team workspaces.
- Mermaid, PlantUML, SVG, and PDF exports.
- Template marketplace.

## Launch Definition

Diagravix AI is launch-ready when the complete prompt-to-diagram-to-edit-to-save-to-export flow works in production and feels polished on desktop and mobile.
