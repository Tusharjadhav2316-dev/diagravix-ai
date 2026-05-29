# Diagravix AI API

## Response Format

All API routes should return structured responses.

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request is invalid"
  }
}
```

## Routes

### `POST /api/diagram/generate`

Generates a diagram from prompt text.

Request:

```json
{
  "prompt": "User logs in, system validates credentials, dashboard opens",
  "diagramType": "flowchart"
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "diagram": {}
  }
}
```

### `POST /api/diagram/enhance`

Improves an existing diagram using deterministic rules and optional AI suggestions.

### `GET /api/diagrams`

Returns diagrams owned by the current authenticated user.

### `POST /api/diagrams`

Creates a saved diagram.

### `PATCH /api/diagrams/[id]`

Updates title, description, visibility, nodes, or edges.

### `DELETE /api/diagrams/[id]`

Deletes a user-owned diagram.

### `GET /api/templates`

Returns public templates.

### `POST /api/feedback`

Stores feedback about generation quality or product experience.

## API Rules

- Validate all request bodies with Zod.
- Never trust client ownership fields.
- Derive `ownerId` from Firebase auth.
- Rate limit generation endpoints.
- Never expose raw provider errors directly.
- Log generation attempts without storing secrets.
