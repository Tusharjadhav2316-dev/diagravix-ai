// Diagram Generation Engine
// Orchestrates NLP extraction and AI-enhanced diagram creation

import { extractDiagramElements, cleanEntities, autoLayoutNodes, buildDiagramStructure } from "./nlp"
import type { DiagramStructure, DiagramNode, DiagramEdge } from "./nlp/diagram-builder"

export interface GeneratedDiagram {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  metadata: {
    sourceText: string
    extractedEntities: number
    extractedRelationships: number
    generatedAt: string
  }
}

export interface GenerationOptions {
  autoLayout?: boolean
  enhanceWithAI?: boolean
  style?: "flowchart" | "mindmap" | "entityrelation" | "sequence"
}

// Generate diagram from text description
export async function generateDiagramFromText(
  text: string,
  options: GenerationOptions = {},
): Promise<GeneratedDiagram> {
  const { autoLayout = true, enhanceWithAI = false, style = "flowchart" } = options

  if (!text || text.trim().length === 0) {
    throw new Error("Text input cannot be empty")
  }

  // Extract diagram elements using NLP
  const parsed = extractDiagramElements(text)
  const cleanedEntities = cleanEntities(parsed.entities)

  // Build basic diagram structure
  let structure = buildDiagramStructure({
    ...parsed,
    entities: cleanedEntities,
  })

  // Apply auto-layout if enabled
  if (autoLayout) {
    structure.nodes = autoLayoutNodes(structure.nodes, structure.edges)
  }

  // Enhance with AI if enabled
  if (enhanceWithAI) {
    structure = await enhanceDiagramWithAI(structure, text, style)
  }

  return {
    nodes: structure.nodes,
    edges: structure.edges,
    metadata: {
      sourceText: text,
      extractedEntities: cleanedEntities.length,
      extractedRelationships: structure.edges.length,
      generatedAt: new Date().toISOString(),
    },
  }
}

// Enhance diagram structure with AI suggestions
async function enhanceDiagramWithAI(
  structure: DiagramStructure,
  sourceText: string,
  style: string,
): Promise<DiagramStructure> {
  try {
    const response = await fetch("/api/diagram/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagram: structure,
        sourceText,
        style,
      }),
    })

    if (!response.ok) {
      console.warn("AI enhancement failed, returning base diagram")
      return structure
    }

    const enhanced = await response.json()
    return enhanced
  } catch (error) {
    console.warn("Error during AI enhancement:", error)
    return structure
  }
}

// Validate diagram structure
export function validateDiagram(diagram: GeneratedDiagram): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!diagram.nodes || diagram.nodes.length === 0) {
    errors.push("Diagram must contain at least one node")
  }

  if (diagram.nodes.some((node) => !node.id || !node.label)) {
    errors.push("All nodes must have an id and label")
  }

  if (diagram.edges.some((edge) => !edge.source || !edge.target)) {
    errors.push("All edges must have source and target")
  }

  // Check for orphaned edges
  const validNodeIds = new Set(diagram.nodes.map((n) => n.id))
  diagram.edges.forEach((edge) => {
    if (!validNodeIds.has(edge.source)) {
      errors.push(`Edge references non-existent source node: ${edge.source}`)
    }
    if (!validNodeIds.has(edge.target)) {
      errors.push(`Edge references non-existent target node: ${edge.target}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Merge multiple diagrams
export function mergeDiagrams(diagrams: GeneratedDiagram[]): GeneratedDiagram {
  if (diagrams.length === 0) {
    throw new Error("At least one diagram is required to merge")
  }

  if (diagrams.length === 1) {
    return diagrams[0]
  }

  const mergedNodes: Map<string, DiagramNode> = new Map()
  const mergedEdges: DiagramEdge[] = []
  let yOffset = 100

  diagrams.forEach((diagram, index) => {
    diagram.nodes.forEach((node) => {
      const newId = `${node.id}-${index}`
      mergedNodes.set(newId, {
        ...node,
        id: newId,
        y: node.y + yOffset,
      })
    })

    diagram.edges.forEach((edge) => {
      mergedEdges.push({
        ...edge,
        id: `${edge.id}-${index}`,
        source: `${edge.source}-${index}`,
        target: `${edge.target}-${index}`,
      })
    })

    yOffset += 400
  })

  return {
    nodes: Array.from(mergedNodes.values()),
    edges: mergedEdges,
    metadata: {
      sourceText: `Merged ${diagrams.length} diagrams`,
      extractedEntities: Array.from(mergedNodes.values()).length,
      extractedRelationships: mergedEdges.length,
      generatedAt: new Date().toISOString(),
    },
  }
}

// Generate alternative layouts for a diagram
export function generateAlternativeLayout(
  diagram: GeneratedDiagram,
  layout: "hierarchical" | "circular" | "grid",
): GeneratedDiagram {
  const nodes = diagram.nodes.map((node, index) => {
    let x = node.x
    let y = node.y

    switch (layout) {
      case "circular": {
        const angle = (index / diagram.nodes.length) * Math.PI * 2
        const radius = 300
        x = 500 + radius * Math.cos(angle)
        y = 300 + radius * Math.sin(angle)
        break
      }
      case "grid": {
        const cols = Math.ceil(Math.sqrt(diagram.nodes.length))
        x = 100 + (index % cols) * 250
        y = 100 + Math.floor(index / cols) * 200
        break
      }
      case "hierarchical":
      default:
        // Keep existing hierarchical layout
        break
    }

    return { ...node, x, y }
  })

  return {
    ...diagram,
    nodes,
  }
}

// Extract text from diagram structure
export function diagramToText(diagram: GeneratedDiagram): string {
  let text = "Diagram Description:\n\n"

  text += "Nodes:\n"
  diagram.nodes.forEach((node) => {
    text += `- ${node.label} (${node.type})\n`
  })

  text += "\nConnections:\n"
  diagram.edges.forEach((edge) => {
    const sourceNode = diagram.nodes.find((n) => n.id === edge.source)
    const targetNode = diagram.nodes.find((n) => n.id === edge.target)
    if (sourceNode && targetNode) {
      text += `- ${sourceNode.label} ${edge.label || "connects to"} ${targetNode.label}\n`
    }
  })

  return text
}
