import type { Diagram, DiagramEdge, DiagramNode, DiagramType } from "@/types/diagram"

interface LegacyNode {
  id: string
  label?: string
  text?: string
  type?: string
  x?: number
  y?: number
  width?: number
  height?: number
}

interface LegacyEdge {
  id?: string
  source: string
  target: string
  label?: string
  relationship?: string
}

interface LegacyDiagram {
  nodes?: LegacyNode[]
  edges?: LegacyEdge[]
  diagram_type?: string
  diagramType?: string
  description?: string
  title?: string
}

export function normalizeLegacyDiagram(input: LegacyDiagram): Diagram {
  const now = new Date().toISOString()
  const diagramType = normalizeDiagramType(input.diagramType ?? input.diagram_type)

  return {
    id: `diagram-${Date.now()}`,
    title: input.title ?? "Untitled Diagram",
    description: input.description ?? "",
    diagramType,
    nodes: (input.nodes ?? []).map(normalizeNode),
    edges: (input.edges ?? []).map(normalizeEdge),
    visibility: "private",
    createdAt: now,
    updatedAt: now,
  }
}

function normalizeDiagramType(value: string | undefined): DiagramType {
  if (value === "class") return "uml_class"
  if (value === "entity_relationship") return "entity_relationship"
  if (value === "sequence") return "sequence"
  if (value === "mindmap") return "mind_map"
  if (value === "component" || value === "deployment") return "architecture"
  if (value === "flowchart") return "flowchart"
  return "generic"
}

function normalizeNode(node: LegacyNode): DiagramNode {
  return {
    id: node.id,
    label: node.label ?? node.text ?? node.id,
    type: node.type ?? "process",
    position: {
      x: node.x ?? 0,
      y: node.y ?? 0,
    },
    width: node.width ?? 160,
    height: node.height ?? 80,
  }
}

function normalizeEdge(edge: LegacyEdge, index: number): DiagramEdge {
  return {
    id: edge.id ?? `edge-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label ?? edge.relationship,
  }
}
