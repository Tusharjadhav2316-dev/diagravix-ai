# Diagravix AI Database

## Firestore Collections

### `users/{uid}`

Stores user profile and app settings.

Fields:

- `uid`
- `displayName`
- `email`
- `photoURL`
- `createdAt`
- `updatedAt`
- `plan`
- `anonymous`

### `diagrams/{diagramId}`

Stores saved diagrams.

Fields:

- `id`
- `ownerId`
- `title`
- `description`
- `diagramType`
- `nodes`
- `edges`
- `visibility`: `private` or `public`
- `createdAt`
- `updatedAt`

Indexes:

- `ownerId`, `updatedAt desc`
- `visibility`, `updatedAt desc`

### `generations/{generationId}`

Tracks AI generation attempts.

Fields:

- `id`
- `ownerId`
- `anonymousId`
- `prompt`
- `diagramType`
- `status`
- `errorCode`
- `createdAt`
- `durationMs`

### `usage/{usageId}`

Tracks rate limits and quotas.

Fields:

- `id`
- `ownerId`
- `anonymousId`
- `dateKey`
- `generationCount`
- `exportCount`
- `updatedAt`

### `feedback/{feedbackId}`

Stores user feedback.

Fields:

- `id`
- `ownerId`
- `diagramId`
- `rating`
- `message`
- `prompt`
- `diagramType`
- `createdAt`

### `templates/{templateId}`

Stores public templates.

Fields:

- `id`
- `title`
- `description`
- `diagramType`
- `nodes`
- `edges`
- `featured`
- `createdAt`
- `updatedAt`

## Security Rules Summary

- Users can read and write only their own private diagrams.
- Public diagrams can be read by anyone.
- Only authenticated users can create saved diagrams.
- Anonymous usage is tracked separately and limited.
- Templates are read-only to clients.
- Feedback can be created by users but not arbitrarily read.
