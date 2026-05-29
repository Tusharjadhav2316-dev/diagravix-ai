// API endpoint for diagram generation

import { type NextRequest, NextResponse } from "next/server"
import { generateDiagramFromText, validateDiagram } from "@/lib/diagram-generator"

export async function POST(request: NextRequest) {
  try {
    const { text, options } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text input is required and must be a string" }, { status: 400 })
    }

    // Generate diagram
    const diagram = await generateDiagramFromText(text, options)

    // Validate diagram
    const validation = validateDiagram(diagram)
    if (!validation.valid) {
      return NextResponse.json({ error: "Generated diagram is invalid", details: validation.errors }, { status: 400 })
    }

    return NextResponse.json(diagram)
  } catch (error) {
    console.error("Diagram generation error:", error)
    return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 })
  }
}
