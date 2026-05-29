import { NextResponse } from "next/server"

export interface ApiError {
  code: string
  message: string
}

export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: ApiError
    }

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, init)
}

export function fail(error: ApiError, init?: ResponseInit): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error }, init)
}
