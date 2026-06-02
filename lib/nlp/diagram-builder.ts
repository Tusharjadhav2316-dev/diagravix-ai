// Converts extracted entities and relationships into diagram structures

import type { Entity, Relationship, ParsedDiagram } from "./entity-extractor"

export interface DiagramNode {
  id: string
  label: string
  type: string
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
function determinNodeType(entity: Entity): string {
  const text = entity.text.toLowerCase()

  if (text.includes("data") || text.includes("input") || text.includes("output")) {
    return "interface"
  }
  if (text.includes("decision") || text.includes("check") || text.includes("validate") || text.includes("verify")) {
    return "decision"
  }
  if (text.includes("database") || text.includes("store") || text.includes("table") || text.includes("sql")) {
    return "database"
  }
  if (text.includes("user") || text.includes("customer") || text.includes("client") || text.includes("admin")) {
    return "actor"
  }
  if (text.includes("entity") || text.includes("schema") || text.includes("model")) {
    return "entity"
  }
  if (text.includes("class") || text.includes("object") || text.includes("service")) {
    return "class"
  }
  if (text.includes("process") || text.includes("execute") || text.includes("perform")) {
    return "process"
  }

  return "process"
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

// Auto-layout nodes with dynamic spacing, collision avoidance, and hierarchy level calculation
export function autoLayoutNodes(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
  const levels = new Map<string, number>()
  const positionsInLevel = new Map<number, string[]>()

  // 1. Level detection using topological depth calculation
  function getDepth(nodeId: string, visited = new Set<string>()): number {
    if (levels.has(nodeId)) return levels.get(nodeId)!
    if (visited.has(nodeId)) return 0 // Guard circular loops

    visited.add(nodeId)
    const incoming = edges.filter((e) => e.target === nodeId)
    if (incoming.length === 0) {
      levels.set(nodeId, 0)
      return 0
    }

    const depth = Math.max(...incoming.map((e) => getDepth(e.source, visited))) + 1
    levels.set(nodeId, depth)
    return depth
  }

  // Determine levels for all nodes
  nodes.forEach((node) => getDepth(node.id))

  // Group nodes by level to determine vertical alignment index
  levels.forEach((level, nodeId) => {
    if (!positionsInLevel.has(level)) {
      positionsInLevel.set(level, [])
    }
    positionsInLevel.get(level)!.push(nodeId)
  })

  // 2. Multi-column spacing & collision avoidance
  const LEVEL_HEIGHT = 160 // Vertical distance between levels
  const COLUMN_WIDTH = 220 // Horizontal distance between siblings
  const BASE_X = 150
  const BASE_Y = 100

  return nodes.map((node) => {
    const level = levels.get(node.id) || 0
    const levelNodes = positionsInLevel.get(level) || []
    const columnIndex = levelNodes.indexOf(node.id)
    const totalColumns = levelNodes.length

    // Center layout mathematically based on column span to reduce edge overlap and crossing
    const offsetX = (columnIndex - (totalColumns - 1) / 2) * COLUMN_WIDTH
    const x = BASE_X + offsetX
    const y = BASE_Y + level * LEVEL_HEIGHT

    return {
      ...node,
      // Apply offset ensuring coordinates remain clean positive integers
      x: Math.round(Math.max(50, x)),
      y: Math.round(Math.max(50, y))
    }
  })
}
