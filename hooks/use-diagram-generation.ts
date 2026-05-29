"use client"

// React hook for diagram generation

import { useState } from "react"
import type { GeneratedDiagram, GenerationOptions } from "@/lib/diagram-generator"

interface UseGenerateDiagramState {
  diagram: GeneratedDiagram | null
  loading: boolean
  error: string | null
}

export function useDiagramGeneration() {
  const [state, setState] = useState<UseGenerateDiagramState>({
    diagram: null,
    loading: false,
    error: null,
  })

  const generate = async (text: string, options?: GenerationOptions) => {
    setState({ diagram: null, loading: true, error: null })

    try {
      const response = await fetch("/api/diagram/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, options }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate diagram")
      }

      const diagram = await response.json()
      setState({ diagram, loading: false, error: null })
      return diagram
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      setState({ diagram: null, loading: false, error: message })
      throw error
    }
  }

  return {
    ...state,
    generate,
  }
}
