export type DiagramType =
  | "flowchart"
  | "uml_class"
  | "entity_relationship"
  | "sequence"
  | "mind_map"
  | "architecture"
  | "generic"

export type DiagramVisibility = "private" | "public"

export interface DiagramPosition {
  x: number
  y: number
}

export interface DiagramNode {
  id: string
  label: string
  type: string
  position: DiagramPosition
  width: number
  height: number
  style?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label?: string
  style?: Record<string, unknown>
}

export interface Diagram {
  id: string
  title: string
  description: string
  diagramType: DiagramType
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  ownerId?: string
  visibility: DiagramVisibility
  createdAt: string
  updatedAt: string
}
