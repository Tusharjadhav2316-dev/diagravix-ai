/**
 * lib/rate-limit.ts
 * High-performance, in-memory client IP rate limiter.
 * Ideal for guarding serverless Next.js API endpoints against abuse.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

export interface RateLimitOptions {
  limit?: number // Max requests allowed in the window
  windowMs?: number // Window size in milliseconds
}

export interface RateLimitResult {
  limited: boolean
  remaining: number
  reset: number
}

/**
 * Check if a client IP address has exceeded its rate limit.
 * @param ip - Client IP address
 * @param options - Limit and window configuration options
 */
export function checkRateLimit(ip: string, options: RateLimitOptions = {}): RateLimitResult {
  const limit = options.limit ?? 10 // default: 10 requests
  const windowMs = options.windowMs ?? 60 * 1000 // default: 1 minute window

  const now = Date.now()
  const record = rateLimitMap.get(ip)

  // Clean expired records occasionally (prevent memory leak)
  if (rateLimitMap.size > 2000) {
    const pruneTime = Date.now()
    for (const [key, val] of rateLimitMap.entries()) {
      if (pruneTime > val.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }

  // If no record exists or the current window has expired, create a new window
  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitMap.set(ip, newRecord)
    return {
      limited: false,
      remaining: limit - 1,
      reset: newRecord.resetTime,
    }
  }

  // If the request limit has been reached, restrict access
  if (record.count >= limit) {
    return {
      limited: true,
      remaining: 0,
      reset: record.resetTime,
    }
  }

  // Increment query count in current window
  record.count += 1
  return {
    limited: false,
    remaining: limit - record.count,
    reset: record.resetTime,
  }
}
