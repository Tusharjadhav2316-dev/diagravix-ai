import { z } from "zod"

// Zod schemas for validating AI inputs and canonical forms

export const NodeShapeSchema = z.enum([
  "process",
  "decision",
  "start",
  "end",
  "database",
  "actor",
  "interface",
  "component",
  "generic"
])

export const AINodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: NodeShapeSchema.default("process"),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional().default(140),
  height: z.number().optional().default(50)
})

export const AIEdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional().default("")
})

export const AIDiagramResponseSchema = z.object({
  diagram_type: z.string().optional().default("flowchart"),
  nodes: z.array(AINodeSchema),
  edges: z.array(AIEdgeSchema)
})

export type AINode = z.infer<typeof AINodeSchema>
export type AIEdge = z.infer<typeof AIEdgeSchema>
export type AIDiagramResponse = z.infer<typeof AIDiagramResponseSchema>
