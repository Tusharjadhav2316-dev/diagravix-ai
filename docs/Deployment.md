# Diagravix AI Deployment

## Local Setup

1. Install dependencies.
2. Create `.env.local`.
3. Configure Firebase client variables.
4. Configure server-only Groq API key.
5. Run the Next.js dev server.
6. Verify generation, editor, auth, save/load, and export.

## Required Environment Variables

Client-safe:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server-only:

- `GROQ_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_B64`

## Vercel Deployment

1. Connect repository to Vercel.
2. Add production env vars.
3. Deploy preview.
4. Run smoke tests.
5. Promote to production.

## Firebase Production Setup

1. Enable Firebase Auth.
2. Enable Google provider.
3. Enable email/password provider.
4. Create Firestore database.
5. Deploy Firestore rules.
6. Add Vercel domain to authorized auth domains.

## SEO Deployment Checklist

- Metadata on all key pages.
- Open Graph images.
- `robots.txt`.
- `sitemap.xml`.
- Canonical URLs.
- Structured data.
- Google Search Console submission.

## Production QA

- Generate diagram as anonymous user.
- Sign in with Google.
- Save and reload diagram.
- Export PNG and JSON.
- Share public diagram URL.
- Verify private diagram is protected.
- Test mobile editor layout.
- Test large diagram performance.
