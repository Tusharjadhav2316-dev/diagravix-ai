"use client"

import { useState } from "react"
import { useDiagramGeneration } from "@/hooks/use-diagram-generation"
import GenerationPanel from "./generation-panel"
import EditorCanvas from "./editor-canvas"
import PropertiesPanel from "./properties-panel"
import { useEditorStore } from "@/stores/editor-store"
import { Sparkles } from "lucide-react"

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
          <div className="flex items-center justify-center h-full p-8 select-none">
            <div className="max-w-md text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-2xl bg-[#7c5cff]/10 border border-[#7c5cff]/20 flex items-center justify-center mx-auto text-[#7c5cff] shadow-lg shadow-[#7c5cff]/5">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#7c5cff] to-[#22d3ee] opacity-15 blur-md pointer-events-none" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#f7f8ff]">Your Canvas is Ready</h3>
                <p className="text-xs text-[#a5adc2] leading-relaxed max-w-xs mx-auto">
                  Type a prompt in the AI Generate panel on the left to build a diagram, or switch to Manual Draw to construct custom layout elements manually.
                </p>
              </div>

              {/* Quick suggestions/hints */}
              <div className="grid grid-cols-1 gap-2 pt-2 text-left max-w-xs mx-auto">
                {[
                  "OAuth login flow with DB checks",
                  "Database schema for payment records",
                  "Microservice API gateway architecture",
                ].map((sug, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-white/5 bg-[#0d1018]/40 text-[11px] text-[#a5adc2] hover:border-white/10 hover:bg-[#0d1018]/80 transition-all duration-200"
                  >
                    <span className="text-[#7c5cff] font-semibold">Try:</span> "{sug}"
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 text-[10px] text-[#677086] font-mono">
                <span className="flex items-center gap-1">
                  Press <kbd className="bg-[#07080d] border border-white/10 px-1 py-0.5 rounded text-[#f7f8ff] font-mono font-bold">Ctrl</kbd> + <kbd className="bg-[#07080d] border border-white/10 px-1 py-0.5 rounded text-[#f7f8ff] font-mono font-bold">K</kbd> for commands
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  Press <kbd className="bg-[#07080d] border border-white/10 px-1 py-0.5 rounded text-[#f7f8ff] font-mono font-bold">?</kbd> for help
                </span>
              </div>
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
