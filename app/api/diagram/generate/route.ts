// API endpoint for diagram generation with validation and rate limiting
import { type NextRequest, NextResponse } from "next/server"
import { generateDiagramWithFallback } from "@/lib/ai-engine"
import { autoLayoutNodes } from "@/lib/nlp/diagram-builder"
import { checkRateLimit } from "@/lib/rate-limit"
import { APIError, validateRequestBody, withRateLimitHeaders } from "@/lib/api-helpers"
import { z } from "zod"

// Zod validation schema
const generateRequestSchema = z.object({
  text: z.string().min(1, "Text description prompt is required"),
  options: z.object({
    style: z.string().optional(),
    autoLayout: z.boolean().optional(),
    enhanceWithAI: z.boolean().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  // 1. Check IP rate limit (limit: 10 generations per minute)
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] 
    || request.headers.get("x-real-ip") 
    || "127.0.0.1"

  const rateLimit = checkRateLimit(clientIp, { limit: 10, windowMs: 60 * 1000 })
  
  if (rateLimit.limited) {
    return APIError.rateLimited("Too many diagram generations. Please wait a minute.", rateLimit.reset)
  }

  try {
    // Read and validate body JSON
    let body: any
    try {
      body = await request.json()
    } catch {
      const res = APIError.badRequest("Invalid JSON in request body")
      return withRateLimitHeaders(res, 10, rateLimit.remaining, rateLimit.reset)
    }

    const validation = validateRequestBody(body, generateRequestSchema)
    if (!validation.success) {
      return withRateLimitHeaders(validation.response, 10, rateLimit.remaining, rateLimit.reset)
    }

    const { text, options } = validation.data
    const style = options?.style || "flowchart"

    // 2. Generate diagram structure
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

    // Apply autoLayout positioning to ensure node spacing is clean
    const positionedNodes = autoLayoutNodes(rawNodes as any, rawEdges as any)

    const successResponse = NextResponse.json({
      success: true,
      diagram_type: result.diagram_type || style,
      nodes: positionedNodes,
      edges: rawEdges
    })

    return withRateLimitHeaders(successResponse, 10, rateLimit.remaining, rateLimit.reset)
  } catch (error: any) {
    console.error("Diagram generation API route error:", error)
    const errRes = APIError.serverError(
      error.message || "Failed to generate diagram structure",
      error
    )
    return withRateLimitHeaders(errRes, 10, rateLimit.remaining, rateLimit.reset)
  }
}
