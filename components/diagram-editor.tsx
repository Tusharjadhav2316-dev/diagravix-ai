"use client"

import { useState } from "react"
import { useDiagramGeneration } from "@/hooks/use-diagram-generation"
import GenerationPanel from "./generation-panel"
import EditorCanvas from "./editor-canvas"
import PropertiesPanel from "./properties-panel"
import { useEditorStore } from "@/stores/editor-store"

interface DiagramEditorProps {
  mode: "draw" | "generate"
}

export default function DiagramEditor({ mode }: DiagramEditorProps) {
  const diagram = useEditorStore((state) => state.diagram)
  const setDiagram = useEditorStore((state) => state.setDiagram)
  const updateNode = useEditorStore((state) => state.updateNode)
  const addNode = useEditorStore((state) => state.addNode)
  const deleteElements = useEditorStore((state) => state.deleteElements)
  const addEdge = useEditorStore((state) => state.addEdge)
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { loading, error } = useDiagramGeneration()

  const handleGenerateDiagram = async (text: string) => {
    try {
      // Determine style dynamically based on keywords in prompt
      let selectedStyle = "flowchart"
      const lowerText = text.toLowerCase()
      if (lowerText.includes("class") || lowerText.includes("object") || lowerText.includes("inherits")) {
        selectedStyle = "class"
      } else if (lowerText.includes("database") || lowerText.includes("table") || lowerText.includes("sql") || lowerText.includes("relation") || lowerText.includes("schema")) {
        selectedStyle = "entityrelation"
      }

      const response = await fetch("/api/diagram/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          options: {
            autoLayout: true,
            enhanceWithAI: false,
            style: selectedStyle,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate diagram")
      }

      const generatedDiagram = await response.json()
      
      // Convert to canonical schema format before setting
      const canonicalDiagram = {
        id: `diagram-${Date.now()}`,
        title: "AI Generated Diagram",
        description: text,
        diagramType: (generatedDiagram.diagram_type || "flowchart") as any,
        nodes: (generatedDiagram.nodes || []).map((n: any) => ({
          id: n.id,
          label: n.label,
          type: n.type || "process",
          position: { x: n.x ?? 100, y: n.y ?? 100 },
          width: n.width || 150,
          height: n.height || 60
        })),
        edges: (generatedDiagram.edges || []).map((e: any) => ({
          id: `edge-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.relationship || ""
        })),
        visibility: "private" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setDiagram(canonicalDiagram)
      setSelectedNodeId(null)
    } catch (err) {
      console.error("Generation error:", err)
    }
  }

  const handleUpdateNode = (nodeId: string, updates: Record<string, unknown>) => {
    updateNode(nodeId, updates as any)
  }

  const handleDeleteNode = (nodeId: string) => {
    deleteElements([nodeId], [])
    setSelectedNodeId(null)
  }

  const handleAddNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      label: "New Node",
      type: "process",
      position: { x: 200, y: 200 },
      width: 150,
      height: 60,
    }

    addNode(newNode)
  }

  const handleConnectNodes = (sourceId: string, targetId: string) => {
    if (!diagram) return

    const edgeExists = diagram.edges.some((e) => e.source === sourceId && e.target === targetId)

    if (!edgeExists) {
      const newEdge = {
        id: `edge-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        label: ""
      }
      addEdge(newEdge)
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
          diagramInfo={diagram ? { extractedEntities: diagram.nodes.length, extractedRelationships: diagram.edges.length } : undefined}
        />
      )}

      {/* Main Canvas */}
      <div className="flex-1 bg-background overflow-hidden">
        {diagram || mode === "draw" ? (
          <EditorCanvas
            diagram={diagram || { nodes: [], edges: [] }}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNode={handleUpdateNode}
            onAddNode={handleAddNode}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">
                Enter text on the left to generate a diagram
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      {(diagram || mode === "draw") && (
        <PropertiesPanel
          diagram={diagram || { nodes: [], edges: [] }}
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
