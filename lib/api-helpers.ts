/**
 * lib/api-helpers.ts
 * Standard helpers for structured Next.js API error handling,
 * Zod validation parsing, and rate-limiting header formatting.
 */

import { NextResponse } from "next/server"
import { z } from "zod"

export interface APIErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

/**
 * Append standard rate-limiting headers to any Next.js Response.
 */
export function withRateLimitHeaders(
  res: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  res.headers.set("X-RateLimit-Limit", limit.toString())
  res.headers.set("X-RateLimit-Remaining", remaining.toString())
  res.headers.set("X-RateLimit-Reset", reset.toString())
  return res
}

/**
 * Standard HTTP error responses.
 */
export const APIError = {
  badRequest(message = "Bad Request", details?: any): NextResponse<APIErrorResponse> {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: "BAD_REQUEST",
          message,
          details,
        },
      },
      { status: 400 }
    )
  },

  unauthorized(message = "Unauthorized"): NextResponse<APIErrorResponse> {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: "UNAUTHORIZED",
          message,
        },
      },
      { status: 401 }
    )
  },

  rateLimited(message = "Too Many Requests", resetTime?: number): NextResponse<APIErrorResponse> {
    const res = NextResponse.json(
      {
        success: false as const,
        error: {
          code: "TOO_MANY_REQUESTS",
          message,
          details: resetTime ? { resetAt: new Date(resetTime).toISOString() } : undefined,
        },
      },
      { status: 429 }
    )
    if (resetTime) {
      res.headers.set("Retry-After", Math.ceil((resetTime - Date.now()) / 1000).toString())
    }
    return res
  },

  serverError(message = "Internal Server Error", details?: any): NextResponse<APIErrorResponse> {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
          details: process.env.NODE_ENV === "development" ? details : undefined,
        },
      },
      { status: 500 }
    )
  },
}

/**
 * Utility to validate a request body with a Zod schema.
 * Automatically throws formatted badRequest response on validation failure.
 */
export function validateRequestBody<T>(
  body: any,
  schema: z.Schema<T>
): { success: true; data: T } | { success: false; response: NextResponse<APIErrorResponse> } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const errorDetails = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }))
    return {
      success: false,
      response: APIError.badRequest("Request validation failed", errorDetails),
    }
  }
  return {
    success: true,
    data: result.data,
  }
}
