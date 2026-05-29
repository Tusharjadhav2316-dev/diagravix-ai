import { z } from "zod"

export const diagramTypeSchema = z.enum([
  "flowchart",
  "uml_class",
  "entity_relationship",
  "sequence",
  "mind_map",
  "architecture",
  "generic",
])

export const diagramVisibilitySchema = z.enum(["private", "public"])

export const diagramPositionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
})

export const diagramNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.string().min(1),
  position: diagramPositionSchema,
  width: z.number().positive(),
  height: z.number().positive(),
  style: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const diagramEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  style: z.record(z.unknown()).optional(),
})

export const diagramSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  diagramType: diagramTypeSchema,
  nodes: z.array(diagramNodeSchema),
  edges: z.array(diagramEdgeSchema),
  ownerId: z.string().optional(),
  visibility: diagramVisibilitySchema.default("private"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type DiagramSchema = z.infer<typeof diagramSchema>
export type DiagramNodeSchema = z.infer<typeof diagramNodeSchema>
export type DiagramEdgeSchema = z.infer<typeof diagramEdgeSchema>
