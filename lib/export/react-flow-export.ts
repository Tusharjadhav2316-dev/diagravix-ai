/**
 * lib/export/react-flow-export.ts
 * High-quality exports from React Flow canvas using html-to-image.
 * Supports PNG (2x/3x), SVG, and PDF via jsPDF.
 */
import type { Diagram } from "@/types/diagram"

// --------------- PNG Export (React Flow DOM) ---------------

/**
 * Export the React Flow canvas element as a high-resolution PNG.
 * @param element - The `.react-flow__viewport` parent container div
 * @param filename - Output filename (no extension)
 * @param pixelRatio - 2 = 2x resolution (retina), 3 = 3x for print
 */
export async function exportFlowToPNG(
  element: HTMLElement,
  filename = "diagram",
  pixelRatio = 2
): Promise<void> {
  const { toPng } = await import("html-to-image")

  const dataUrl = await toPng(element, {
    backgroundColor: "#07080d",
    pixelRatio,
    style: {
      transform: "none",
    },
    filter: (node: Element) => {
      // Exclude controls, minimap, and attribution from export
      const excludeClasses = [
        "react-flow__controls",
        "react-flow__minimap",
        "react-flow__attribution",
        "react-flow__panel",
      ]
      return !excludeClasses.some((cls) =>
        (node as HTMLElement).classList?.contains(cls)
      )
    },
  })

  downloadDataUrl(dataUrl, `${filename}.png`)
}

// --------------- SVG Export ---------------

export async function exportFlowToSVG(
  element: HTMLElement,
  filename = "diagram"
): Promise<void> {
  const { toSvg } = await import("html-to-image")

  const dataUrl = await toSvg(element, {
    backgroundColor: "#07080d",
    filter: (node: Element) => {
      const excludeClasses = [
        "react-flow__controls",
        "react-flow__minimap",
        "react-flow__attribution",
        "react-flow__panel",
      ]
      return !excludeClasses.some((cls) =>
        (node as HTMLElement).classList?.contains(cls)
      )
    },
  })

  downloadDataUrl(dataUrl, `${filename}.svg`)
}

// --------------- PDF Export ---------------

export async function exportFlowToPDF(
  element: HTMLElement,
  filename = "diagram"
): Promise<void> {
  const { toPng } = await import("html-to-image")
  const { jsPDF } = await import("jspdf")

  const dataUrl = await toPng(element, {
    backgroundColor: "#07080d",
    pixelRatio: 2,
    filter: (node: Element) => {
      const excludeClasses = [
        "react-flow__controls",
        "react-flow__minimap",
        "react-flow__attribution",
        "react-flow__panel",
      ]
      return !excludeClasses.some((cls) =>
        (node as HTMLElement).classList?.contains(cls)
      )
    },
  })

  const img = new Image()
  img.src = dataUrl
  await new Promise((res) => (img.onload = res))

  const imgWidth = img.naturalWidth
  const imgHeight = img.naturalHeight

  // A4 landscape for large diagrams
  const orientation = imgWidth > imgHeight ? "landscape" : "portrait"
  const pdf = new jsPDF({ orientation, unit: "px", format: [imgWidth / 2, imgHeight / 2] })

  pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth / 2, imgHeight / 2)
  pdf.save(`${filename}.pdf`)
}

// --------------- JSON Export ---------------

export function exportFlowToJSON(diagram: Diagram, filename?: string): void {
  const name = filename ?? diagram.title ?? "diagram"
  const json = JSON.stringify(diagram, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  downloadBlob(blob, `${name}.json`)
}

// --------------- JSON Import ---------------

export async function importFromJSON(file: File): Promise<Diagram> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // Basic validation
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error("Invalid diagram JSON: missing nodes array")
        }
        resolve(data as Diagram)
      } catch (err) {
        reject(new Error("Invalid JSON file: " + (err as Error).message))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// --------------- Mermaid Export ---------------

export function exportToMermaidText(diagram: Diagram): string {
  const lines: string[] = ["graph TD"]

  diagram.nodes.forEach((node) => {
    const label = (node.label || node.id).replace(/"/g, '\\"')
    const shape = getMermaidShape(node.type)
    lines.push(`  ${sanitizeId(node.id)}${shape.open}"${label}"${shape.close}`)
  })

  diagram.edges.forEach((edge) => {
    const label = edge.label ? `|"${edge.label}"|` : ""
    lines.push(`  ${sanitizeId(edge.source)} -->${label} ${sanitizeId(edge.target)}`)
  })

  return lines.join("\n")
}

export function exportToMermaidFile(diagram: Diagram, filename?: string): void {
  const code = exportToMermaidText(diagram)
  const blob = new Blob([code], { type: "text/plain" })
  downloadBlob(blob, `${filename ?? diagram.title ?? "diagram"}.mmd`)
}

// --------------- PlantUML Export ---------------

export function exportToPlantUMLText(diagram: Diagram): string {
  const lines: string[] = ["@startuml", ""]

  diagram.nodes.forEach((node) => {
    const label = (node.label || node.id).replace(/"/g, "'")
    lines.push(`(${label}) as ${sanitizeId(node.id)}`)
  })

  lines.push("")

  diagram.edges.forEach((edge) => {
    const arrow = edge.label ? ` : ${edge.label}` : ""
    lines.push(`${sanitizeId(edge.source)} --> ${sanitizeId(edge.target)}${arrow}`)
  })

  lines.push("", "@enduml")
  return lines.join("\n")
}

export function exportToPlantUMLFile(diagram: Diagram, filename?: string): void {
  const code = exportToPlantUMLText(diagram)
  const blob = new Blob([code], { type: "text/plain" })
  downloadBlob(blob, `${filename ?? diagram.title ?? "diagram"}.puml`)
}

// --------------- Utilities ---------------

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a")
  link.download = filename
  link.href = dataUrl
  link.click()
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.download = filename
  link.href = url
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_")
}

function getMermaidShape(type?: string): { open: string; close: string } {
  switch (type) {
    case "decision": return { open: "{", close: "}" }
    case "database": return { open: "[(", close: ")]" }
    case "actor": return { open: "([", close: "])" }
    case "entity": return { open: "[", close: "]" }
    default: return { open: "[", close: "]" }
  }
}
