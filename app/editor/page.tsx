"use client"

import { useState } from "react"
import DiagramEditor from "@/components/diagram-editor"
import { Button } from "@/components/ui/button"

export default function EditorPage() {
  const [mode, setMode] = useState<"draw" | "generate">("generate")

  return (
    <main className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Diagram Editor</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Generate diagrams from text or draw manually. Export to PNG, SVG, PDF, Mermaid, or PlantUML
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant={mode === "generate" ? "default" : "outline"} onClick={() => setMode("generate")}>
                AI Generate
              </Button>
              <Button variant={mode === "draw" ? "default" : "outline"} onClick={() => setMode("draw")}>
                Manual Draw
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <DiagramEditor mode={mode} />
        </div>
      </div>
    </main>
  )
}
