interface MermaidDiagram {
  nodes: Array<{ id: string; label: string }>
  edges: Array<{ source: string; target: string; label?: string; relationship?: string }>
}

export function exportToMermaid(diagram: MermaidDiagram): string {
  let mermaidCode = "graph TD\n"

  // Add nodes
  diagram.nodes.forEach((node) => {
    const label = node.label.replace(/"/g, '\\"')
    mermaidCode += `  ${node.id}["${label}"]\n`
  })

  // Add relationships
  diagram.edges.forEach((edge) => {
    const relationship = edge.label || edge.relationship || ""
    if (relationship) {
      mermaidCode += `  ${edge.source} -->|${relationship}| ${edge.target}\n`
    } else {
      mermaidCode += `  ${edge.source} --> ${edge.target}\n`
    }
  })
  return mermaidCode
}
