const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export interface DiagramRequest {
  text: string
  diagram_type?: string
}

export interface DiagramData {
  nodes: Array<{
    id: string
    label: string
    type: string
    x: number
    y: number
    width: number
    height: number
  }>
  edges: Array<{
    source: string
    target: string
    relationship?: string
  }>
  diagram_type: string
  description: string
}

export async function generateDiagramFromText(request: DiagramRequest): Promise<DiagramData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-diagram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let errorMessage = "Failed to generate diagram"

      if (contentType?.includes("application/json")) {
        const error = await response.json()
        errorMessage = error.detail || error.message || errorMessage
        
        if (typeof errorMessage === 'string' && errorMessage.includes('429')) {
          errorMessage = "AI rate limit exceeded (Free Tier allows 5 requests per minute). Please wait 30 seconds and try again."
        }
      } else {
        errorMessage = `Backend error (${response.status}): Backend server at ${API_BASE_URL} is not responding. Make sure FastAPI is running.`
      }

      throw new Error(errorMessage)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      throw new Error(`Backend returned invalid response. Backend server at ${API_BASE_URL} may not be running.`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Diagram generation error:", error)
    throw error
  }
}

export async function enhanceDiagram<TDiagram>(diagramData: TDiagram): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/enhance-diagram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(diagramData),
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let errorMessage = "Failed to enhance diagram"

      if (contentType?.includes("application/json")) {
        const error = await response.json()
        errorMessage = error.detail || error.message || errorMessage
      } else {
        errorMessage = `Backend error (${response.status}): Backend server is not responding correctly.`
      }

      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Diagram enhancement error:", error)
    throw error
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
