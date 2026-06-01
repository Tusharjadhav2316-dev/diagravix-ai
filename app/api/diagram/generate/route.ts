// API endpoint for diagram generation with multi-provider fallback orchestration
import { type NextRequest, NextResponse } from "next/server"
import { generateDiagramWithFallback } from "@/lib/ai-engine"
import { autoLayoutNodes } from "@/lib/nlp/diagram-builder"

export async function POST(request: NextRequest) {
  try {
    const { text, options } = await request.json()
    const style = options?.style || "flowchart"

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text description prompt is required" }, { status: 400 })
    }

    // Generate diagram using the fallback AI engine (Groq -> Gemini -> local NLP fallback)
    const result = await generateDiagramWithFallback(text, style)

    // Map AI output values to structured layout engine nodes
    const rawNodes = result.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type || "process",
      x: n.x ?? 100,
      y: n.y ?? 100,
      width: n.width || 140,
      height: n.height || 50
    }))

    const rawEdges = result.edges.map((e, index) => ({
      id: e.id || `edge-${e.source}-${e.target}-${index}`,
      source: e.source,
      target: e.target,
      label: e.label || "",
      type: "connection" as const
    }))

    // Apply autoLayout positioning to ensure node spacing is pristine
    const positionedNodes = autoLayoutNodes(rawNodes as any, rawEdges as any)

    return NextResponse.json({
      diagram_type: result.diagram_type || style,
      nodes: positionedNodes,
      edges: rawEdges
    })
  } catch (error: any) {
    console.error("Diagram generation API route error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate diagram structure" }, { status: 500 })
  }
}
