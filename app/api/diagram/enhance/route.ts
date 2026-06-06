// API endpoint for AI-enhanced diagram generation
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"
import { APIError, validateRequestBody, withRateLimitHeaders } from "@/lib/api-helpers"

const enhanceRequestSchema = z.object({
  diagram: z.object({
    nodes: z.array(z.record(z.unknown())),
    edges: z.array(z.record(z.unknown())).optional().default([]),
  }).passthrough(),
  sourceText: z.string().min(1, "sourceText is required"),
  style: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // 1. Check IP rate limit (limit: 10 enhancements per minute)
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] 
    || request.headers.get("x-real-ip") 
    || "127.0.0.1"

  const rateLimit = checkRateLimit(clientIp, { limit: 10, windowMs: 60 * 1000 })
  
  if (rateLimit.limited) {
    return APIError.rateLimited("Too many diagram enhancement requests. Please wait a minute.", rateLimit.reset)
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

    const validation = validateRequestBody(body, enhanceRequestSchema)
    if (!validation.success) {
      return withRateLimitHeaders(validation.response, 10, rateLimit.remaining, rateLimit.reset)
    }

    const { diagram } = validation.data

    // Return the diagram as-is with basic enhancements (can be further wired to Gemini if needed)
    const enhancedDiagram = {
      ...diagram,
      nodes: diagram.nodes.map((node) => ({
        ...node,
      })),
    }

    const successResponse = NextResponse.json({
      success: true,
      data: enhancedDiagram
    })

    return withRateLimitHeaders(successResponse, 10, rateLimit.remaining, rateLimit.reset)
  } catch (error: any) {
    console.error("Diagram enhancement error:", error)
    const errRes = APIError.serverError("Failed to enhance diagram", error)
    return withRateLimitHeaders(errRes, 10, rateLimit.remaining, rateLimit.reset)
  }
}
