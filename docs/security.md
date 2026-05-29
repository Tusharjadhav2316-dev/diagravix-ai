# Diagravix AI Security

## Core Security Rules

- Never expose AI provider keys client-side.
- Never trust client-provided `ownerId`.
- Validate every request body with Zod.
- Protect saved diagrams by Firebase Auth.
- Enforce Firestore rules for per-user access.
- Rate limit AI generation.
- Sanitize user-visible AI output.

## Authentication

Firebase Auth methods:

- Google login.
- Email/password.
- Anonymous usage for limited free generations.

Authenticated users can:

- Save diagrams.
- Load history.
- Export.
- Share diagrams.

Anonymous users can:

- Generate limited diagrams.
- Export JSON locally.
- Be prompted to sign in before saving.

## API Key Handling

- Groq key must exist only in server environment variables.
- Firebase Admin credentials must exist only server-side.
- `NEXT_PUBLIC_` variables may only contain safe Firebase client config.

## Rate Limiting

Generation endpoint should limit by:

- authenticated user id, or
- anonymous id, or
- IP fallback.

Suggested MVP limits:

- Anonymous: 5 generations per day.
- Authenticated: 30 generations per day.

## Firestore Access

- Users can read/write their own private diagrams.
- Public diagrams can be read by anyone.
- Templates are read-only to clients.
- Feedback creation is allowed; broad feedback reads are admin-only.

## Production Checklist

- `.env.local` is ignored.
- No secrets are committed.
- TypeScript errors are not ignored.
- Firebase rules are deployed.
- Production env vars are configured in Vercel.
- API routes return safe structured errors.
