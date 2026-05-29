// Converts extracted entities and relationships into diagram structures

import type { Entity, Relationship, ParsedDiagram } from "./entity-extractor"

export interface DiagramNode {
  id: string
  label: string
  type: "process" | "data" | "decision" | "entity"
  x: number
  y: number
  width: number
  height: number
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label: string
  type: "connection" | "flow" | "relationship"
}

export interface DiagramStructure {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

// Convert parsed elements to diagram nodes
export function buildDiagramNodes(entities: Entity[], baseX = 100, baseY = 100): DiagramNode[] {
  return entities.map((entity, index) => ({
    id: entity.id,
    label: entity.text,
    type: determinNodeType(entity),
    x: baseX + (index % 3) * 250,
    y: baseY + Math.floor(index / 3) * 200,
    width: 150,
    height: 80,
  }))
}

// Determine node type based on entity characteristics
function determinNodeType(entity: Entity): "process" | "data" | "decision" | "entity" {
  const text = entity.text.toLowerCase()

  if (text.includes("data") || text.includes("input") || text.includes("output")) {
    return "data"
  }
  if (text.includes("decision") || text.includes("check") || text.includes("validate")) {
    return "decision"
  }
  if (text.includes("process") || text.includes("execute") || text.includes("perform")) {
    return "process"
  }

  return "entity"
}

// Convert relationships to diagram edges
export function buildDiagramEdges(relationships: Relationship[]): DiagramEdge[] {
  return relationships.map((rel, index) => ({
    id: `edge-${index}`,
    source: rel.source.id,
    target: rel.target.id,
    label: rel.verb,
    type: "connection",
  }))
}

// Build complete diagram from parsed data
export function buildDiagramStructure(parsed: ParsedDiagram): DiagramStructure {
  const nodes = buildDiagramNodes(parsed.entities)
  const edges = buildDiagramEdges(parsed.relationships)

  return {
    nodes,
    edges,
  }
}

// Auto-layout nodes in a hierarchical structure
export function autoLayoutNodes(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
  const levels = new Map<string, number>()
  let maxLevel = 0

  // Calculate node levels
  function calculateLevel(nodeId: string): number {
    if (levels.has(nodeId)) return levels.get(nodeId)!

    const incomingEdges = edges.filter((e) => e.target === nodeId)
    if (incomingEdges.length === 0) {
      levels.set(nodeId, 0)
      return 0
    }

    const maxSourceLevel = Math.max(...incomingEdges.map((e) => calculateLevel(e.source)))
    const level = maxSourceLevel + 1
    levels.set(nodeId, level)
    maxLevel = Math.max(maxLevel, level)

    return level
  }

  // Calculate levels for all nodes
  nodes.forEach((node) => calculateLevel(node.id))

  // Position nodes by level
  const nodesByLevel = new Map<number, string[]>()
  levels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, [])
    }
    nodesByLevel.get(level)!.push(nodeId)
  })

  // Layout nodes
  return nodes.map((node) => {
    const level = levels.get(node.id) || 0
    const nodesInLevel = nodesByLevel.get(level) || []
    const indexInLevel = nodesInLevel.indexOf(node.id)
    const nodesCount = nodesInLevel.length

    const y = 100 + level * 200
    const x = 100 + (indexInLevel - (nodesCount - 1) / 2) * 250

    return {
      ...node,
      x: Math.max(100, x),
      y,
    }
  })
}
