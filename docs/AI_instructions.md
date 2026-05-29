# Diagravix AI Instructions

## AI Role

The AI is a diagram structure generator. It must convert user intent into strict JSON that matches the canonical diagram schema.

The AI must not:

- return markdown around JSON,
- invent renderer-specific code,
- create React components,
- control visual rendering directly,
- include secrets or unsafe content.

## Generation Rules

- Return valid JSON only.
- Include readable labels.
- Use unique node and edge ids.
- Use semantic node types.
- Create meaningful edges.
- Avoid excessive node counts.
- Prefer clarity over completeness.

## Supported Diagram Types

- `flowchart`
- `uml_class`
- `entity_relationship`
- `sequence`
- `mind_map`
- `architecture`
- `generic`

## Prompt Contract

The prompt builder should provide:

- user prompt,
- requested diagram type,
- canonical schema,
- node and edge count guidance,
- quality rules,
- examples only when useful.

## Validation And Recovery

If the AI response is invalid:

1. Attempt JSON extraction.
2. Validate with Zod.
3. Retry once with a repair prompt.
4. If still invalid, return a safe structured error.

Invalid AI output must never crash the app.

## Quality Rubric

A generated diagram is good when:

- it is easy to understand at first glance,
- nodes are not duplicated unnecessarily,
- relationships are meaningful,
- layout can be rendered cleanly,
- labels are concise,
- diagram type conventions are respected.

## Example Instruction

Return a single JSON object matching the Diagravix diagram schema. Do not include markdown. Do not include commentary. Use clear node labels, meaningful edge labels, and diagram-type-appropriate node types.
