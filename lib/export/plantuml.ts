interface PlantUmlDiagram {
  nodes: Array<{ id: string; label: string }>
  edges: Array<{ source: string; target: string; label?: string; relationship?: string }>
}

export function exportToPlantUML(diagram: PlantUmlDiagram): string {
  let plantumlCode = "@startuml\n"
  plantumlCode += "!theme plain\n"
  plantumlCode += "skinparam backgroundColor #ffffff\n\n"

  // Add nodes based on diagram type
  diagram.nodes.forEach((node) => {
    const label = node.label.replace(/"/g, '\\"')
    plantumlCode += `object ${node.id} as "${label}"\n`
  })

  plantumlCode += "\n"

  // Add relationships
  diagram.edges.forEach((edge) => {
    const relationship = edge.label || edge.relationship || ""
    if (relationship) {
      plantumlCode += `${edge.source} --> ${edge.target} : ${relationship}\n`
    } else {
      plantumlCode += `${edge.source} --> ${edge.target}\n`
    }
  })

  plantumlCode += "\n@enduml\n"
  return plantumlCode
}
