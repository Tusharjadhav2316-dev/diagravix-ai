# Diagravix AI Tech Stack

## Frontend

- Next.js App Router.
- React.
- TypeScript strict mode.
- Tailwind CSS.
- shadcn/ui.
- Framer Motion.
- React Flow for diagram rendering and editing.
- Zustand for client state.
- Zod for validation.

## Backend

- Next.js API routes.
- Firebase Auth.
- Firestore.
- Firebase Storage later if needed for assets or exports.

## AI Layer

- Groq API initially.
- Provider abstraction for OpenAI-compatible future providers.
- AI service returns structured JSON only.
- Rendering logic remains fully deterministic in app code.

## Deployment

- Vercel for frontend and API routes.
- Firebase production project for Auth and Firestore.

## Development Tools

- ESLint.
- Prettier.
- TypeScript compiler.
- Browser QA with local development server.

## Required Dependencies

Core:

- `reactflow` or `@xyflow/react`
- `firebase`
- `firebase-admin`
- `zod`
- `zustand`
- `framer-motion`
- `groq-sdk`

Quality:

- `eslint`
- `prettier`
- `eslint-config-next`

## Architecture Rules

- No giant generated files.
- No business logic inside UI components.
- No duplicate diagram schemas.
- No ignored TypeScript errors in production.
- No API keys in client code.
- Heavy editor modules should be lazy-loaded where possible.
