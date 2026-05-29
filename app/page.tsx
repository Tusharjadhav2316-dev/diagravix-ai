"use client"

import { useState, useRef } from "react"
import { Loader2, Sparkles, Download, Code2, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EditorCanvas, { type EditorCanvasHandle } from "@/components/editor-canvas"
import { generateDiagramFromText } from "@/lib/api-client"
import * as exportLib from "@/lib/export"

interface DiagramNode {
  id: string
  label: string
  type: string
  x: number
  y: number
  width: number
  height: number
}

interface DiagramEdge {
  source: string
  target: string
  relationship?: string
}

interface GeneratedDiagram {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  diagram_type: string
  description: string
}

export default function Home() {
  const [description, setDescription] = useState("")
  const [diagramType, setDiagramType] = useState("flowchart")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [diagram, setDiagram] = useState<GeneratedDiagram>({
    nodes: [],
    edges: [],
    diagram_type: "flowchart",
    description: "",
  })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeLabel, setSelectedNodeLabel] = useState("")
  const stageRef = useRef<EditorCanvasHandle | null>(null)

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please enter a diagram description")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await generateDiagramFromText({
        text: description,
        diagram_type: diagramType,
      })
      setDiagram(result)
      setSelectedNodeId(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate diagram. Make sure the backend is running."
      console.log("[v0] Generation error:", message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectNode = (id: string | null) => {
    setSelectedNodeId(id)
    if (id) {
      const node = diagram.nodes.find((n) => n.id === id)
      if (node) {
        setSelectedNodeLabel(node.label)
      }
    }
  }

  const handleUpdateNodeLabel = () => {
    if (selectedNodeId) {
      setDiagram({
        ...diagram,
        nodes: diagram.nodes.map((n) => (n.id === selectedNodeId ? { ...n, label: selectedNodeLabel } : n)),
      })
    }
  }

  const handleUpdateNode = (id: string, updates: Partial<DiagramNode>) => {
    setDiagram({
      ...diagram,
      nodes: diagram.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })
  }

  const handleAddNode = () => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      label: "New Node",
      type: "process",
      x: 100,
      y: 100,
      width: 120,
      height: 80,
    }
    setDiagram({
      ...diagram,
      nodes: [...diagram.nodes, newNode],
    })
  }

  const handleExportPNG = async () => {
    if (stageRef.current) {
      try {
        const dataURL = await exportLib.exportToPNG(stageRef.current)
        const link = document.createElement("a")
        link.href = dataURL
        link.download = "diagram.png"
        link.click()
      } catch (err) {
        console.log("[v0] PNG export error:", err)
        setError("Failed to export PNG")
      }
    }
  }

  const handleExportSVG = async () => {
    if (stageRef.current) {
      try {
        const svgString = await exportLib.exportToSVG(stageRef.current)
        const link = document.createElement("a")
        const blob = new Blob([svgString], { type: "image/svg+xml" })
        link.href = URL.createObjectURL(blob)
        link.download = "diagram.svg"
        link.click()
      } catch (err) {
        console.log("[v0] SVG export error:", err)
        setError("Failed to export SVG")
      }
    }
  }

  const handleExportPDF = async () => {
    if (stageRef.current) {
      try {
        await exportLib.exportToPDF(stageRef.current, "diagram.pdf")
      } catch (err) {
        console.log("[v0] PDF export error:", err)
        setError("Failed to export PDF")
      }
    }
  }

  const handleExportMermaid = () => {
    try {
      const mermaidCode = exportLib.exportToMermaid(diagram)
      const link = document.createElement("a")
      const blob = new Blob([mermaidCode], { type: "text/plain" })
      link.href = URL.createObjectURL(blob)
      link.download = "diagram.md"
      link.click()
    } catch (err) {
      console.log("[v0] Mermaid export error:", err)
      setError("Failed to export Mermaid")
    }
  }

  const handleExportPlantUML = () => {
    try {
      const plantUMLCode = exportLib.exportToPlantUML(diagram)
      const link = document.createElement("a")
      const blob = new Blob([plantUMLCode], { type: "text/plain" })
      link.href = URL.createObjectURL(blob)
      link.download = "diagram.puml"
      link.click()
    } catch (err) {
      console.log("[v0] PlantUML export error:", err)
      setError("Failed to export PlantUML")
    }
  }

  const handleExportJSON = () => {
    try {
      const jsonString = exportLib.exportToJSON(diagram)
      const link = document.createElement("a")
      const blob = new Blob([jsonString], { type: "application/json" })
      link.href = URL.createObjectURL(blob)
      link.download = "diagram.json"
      link.click()
    } catch (err) {
      console.log("[v0] JSON export error:", err)
      setError("Failed to export JSON")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          {/* Title and description moved to left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Diagram Generator</h1>
              <p className="text-sm text-muted-foreground">
                Create professional diagrams from natural language with Gemini AI
              </p>
            </div>
          </div>

          {diagram.nodes.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2" variant="default">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Image Formats</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportPNG} className="gap-2">
                  <Download className="w-4 h-4" />
                  PNG Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSVG} className="gap-2">
                  <Download className="w-4 h-4" />
                  SVG Vector
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
                  <Download className="w-4 h-4" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Code Formats</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportMermaid} className="gap-2">
                  <Code2 className="w-4 h-4" />
                  Mermaid Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPlantUML} className="gap-2">
                  <Code2 className="w-4 h-4" />
                  PlantUML Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Data Format</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportJSON} className="gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Input */}
        <div className="w-96 border-r border-border bg-card/50 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Diagram Type Selection */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Diagram Type</label>
              <Select value={diagramType} onValueChange={setDiagramType} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>General</SelectLabel>
                    <SelectItem value="flowchart">Flowchart</SelectItem>
                    <SelectItem value="mindmap">Mind Map</SelectItem>
                    <SelectItem value="entity_relationship">ER Diagram</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>UML Structural</SelectLabel>
                    <SelectItem value="class">Class Diagram</SelectItem>
                    <SelectItem value="component">Component Diagram</SelectItem>
                    <SelectItem value="deployment">Deployment Diagram</SelectItem>
                    <SelectItem value="object">Object Diagram</SelectItem>
                    <SelectItem value="package">Package Diagram</SelectItem>
                    <SelectItem value="profile">Profile Diagram</SelectItem>
                    <SelectItem value="composite_structure">Composite Structure Diagram</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>UML Behavioral</SelectLabel>
                    <SelectItem value="use_case">Use Case Diagram</SelectItem>
                    <SelectItem value="activity">Activity Diagram</SelectItem>
                    <SelectItem value="state_machine">State Machine Diagram</SelectItem>
                    <SelectItem value="sequence">Sequence Diagram</SelectItem>
                    <SelectItem value="communication">Communication Diagram</SelectItem>
                    <SelectItem value="interaction_overview">Interaction Overview Diagram</SelectItem>
                    <SelectItem value="timing">Timing Diagram</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Description Input */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Describe Your Diagram</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: User logs in, system validates credentials, if valid show dashboard, if invalid show error message and redirect to login"
                className="min-h-32 resize-none"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Be specific about entities, actions, and relationships for best results.
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              size="lg"
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Diagram
                </>
              )}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Diagram Info */}
            {diagram.nodes.length > 0 && (
              <Card className="p-4 bg-background/50">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Nodes: <span className="text-foreground font-semibold">{diagram.nodes.length}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Connections: <span className="text-foreground font-semibold">{diagram.edges.length}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Type: <span className="text-foreground font-semibold capitalize">{diagram.diagram_type}</span>
                  </p>
                </div>
              </Card>
            )}

            {/* Tips */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Tips for better results:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use action verbs (sends, validates, displays)</li>
                <li>• Name entities clearly (User, Database, API)</li>
                <li>• Describe conditions (if valid, then, else)</li>
                <li>• Include all decision points</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - Canvas */}
        <div className="flex-1 flex flex-col bg-background">
          {diagram.nodes.length > 0 ? (
            <div className="flex-1 overflow-hidden">
              <EditorCanvas
                ref={stageRef}
                diagram={diagram}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
                onUpdateNode={handleUpdateNode}
                onAddNode={handleAddNode}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="space-y-4">
                <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-muted-foreground">No diagram yet</p>
                  <p className="text-sm text-muted-foreground">
                    Enter a description and click &quot;Generate Diagram&quot; to get started
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Node Properties Panel */}
          {selectedNodeId && diagram.nodes.length > 0 && (
            <div className="border-t border-border bg-card/50 p-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-foreground mb-2 block">Edit Node Label</label>
                    <input
                      type="text"
                      value={selectedNodeLabel}
                      onChange={(e) => setSelectedNodeLabel(e.target.value)}
                      onBlur={handleUpdateNodeLabel}
                      className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setDiagram({
                        ...diagram,
                        nodes: diagram.nodes.filter((n) => n.id !== selectedNodeId),
                      })
                      setSelectedNodeId(null)
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    Delete Node
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
