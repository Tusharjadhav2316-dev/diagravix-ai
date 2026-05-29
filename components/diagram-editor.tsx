"use client"

import { useState } from "react"
import { useDiagramGeneration } from "@/hooks/use-diagram-generation"
import GenerationPanel from "./generation-panel"
import EditorCanvas from "./editor-canvas"
import PropertiesPanel from "./properties-panel"
import type { GeneratedDiagram } from "@/lib/diagram-generator"

interface DiagramEditorProps {
  mode: "draw" | "generate"
}

export default function DiagramEditor({ mode }: DiagramEditorProps) {
  const [diagram, setDiagram] = useState<GeneratedDiagram | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { loading, error } = useDiagramGeneration()

  const handleGenerateDiagram = async (text: string) => {
    try {
      const response = await fetch("/api/diagram/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          options: {
            autoLayout: true,
            enhanceWithAI: false,
            style: "flowchart",
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate diagram")
      }

      const generatedDiagram = await response.json()
      setDiagram(generatedDiagram)
      setSelectedNodeId(null)
    } catch (err) {
      console.error("Generation error:", err)
    }
  }

  const handleUpdateNode = (nodeId: string, updates: Record<string, unknown>) => {
    if (!diagram) return

    setDiagram({
      ...diagram,
      nodes: diagram.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)),
    })
  }

  const handleDeleteNode = (nodeId: string) => {
    if (!diagram) return

    const newNodes = diagram.nodes.filter((n) => n.id !== nodeId)
    const newEdges = diagram.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)

    setDiagram({
      ...diagram,
      nodes: newNodes,
      edges: newEdges,
    })
    setSelectedNodeId(null)
  }

  const handleAddNode = () => {
    if (!diagram) return

    const newNode = {
      id: `node-${Date.now()}`,
      label: "New Node",
      type: "process" as const,
      x: 200,
      y: 200,
      width: 150,
      height: 80,
    }

    setDiagram({
      ...diagram,
      nodes: [...diagram.nodes, newNode],
    })
  }

  const handleConnectNodes = (sourceId: string, targetId: string) => {
    if (!diagram) return

    const edgeExists = diagram.edges.some((e) => e.source === sourceId && e.target === targetId)

    if (!edgeExists) {
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: sourceId,
        target: targetId,
        label: "connects",
        type: "connection" as const,
      }

      setDiagram({
        ...diagram,
        edges: [...diagram.edges, newEdge],
      })
    }
  }

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      {mode === "generate" && (
        <GenerationPanel
          onGenerate={handleGenerateDiagram}
          loading={loading}
          error={error}
          diagramInfo={diagram?.metadata}
        />
      )}

      {/* Main Canvas */}
      <div className="flex-1 bg-background overflow-hidden">
        {diagram ? (
          <EditorCanvas
            diagram={diagram}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNode={handleUpdateNode}
            onAddNode={handleAddNode}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">
                {mode === "generate"
                  ? "Enter text on the left to generate a diagram"
                  : 'Click "Add Node" to start drawing'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      {diagram && (
        <PropertiesPanel
          diagram={diagram}
          selectedNodeId={selectedNodeId}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onAddNode={handleAddNode}
          onConnect={handleConnectNodes}
        />
      )}
    </div>
  )
}
