"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Suspense } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/firebase/client"
import type { Diagram } from "@/types/diagram"
import CustomNode from "@/components/custom-node"
import { Loader2, Sparkles, Lock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const nodeTypes = { customNode: CustomNode }

function SharePageContent() {
  const params = useParams()
  const diagramId = params?.id as string

  const [diagram, setDiagram] = useState<Diagram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!diagramId) return

    const fetchDiagram = async () => {
      try {
        const snap = await getDoc(doc(db, "diagrams", diagramId))

        if (!snap.exists()) {
          setError("Diagram not found.")
          return
        }

        const data = snap.data()

        if (data.visibility !== "public") {
          setError("This diagram is private.")
          return
        }

        const d = data.data as Diagram
        setDiagram(d)

        // Convert to React Flow nodes
        const rfNodes: Node[] = (d.nodes || []).map((n: any) => ({
          id: n.id,
          type: "customNode",
          position: n.position || { x: n.x ?? 100, y: n.y ?? 100 },
          data: {
            label: n.label || n.text || n.id,
            type: n.type || "process",
            width: n.width || 150,
            height: n.height || 60,
          },
        }))

        const rfEdges: Edge[] = (d.edges || []).map((e: any, i: number) => ({
          id: e.id || `edge-${e.source}-${e.target}-${i}`,
          source: e.source,
          target: e.target,
          label: e.label || "",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#7c5cff" },
          style: { stroke: "#7c5cff", strokeWidth: 2 },
        }))

        setNodes(rfNodes)
        setEdges(rfEdges)
      } catch (err: any) {
        setError("Failed to load diagram.")
      } finally {
        setLoading(false)
      }
    }

    fetchDiagram()
  }, [diagramId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#7c5cff] animate-spin mx-auto" />
          <p className="text-sm text-[#677086]">Loading diagram...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5 max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#f7f8ff] mb-2">{error}</h2>
            <p className="text-sm text-[#677086]">
              This diagram may be private or the link may be incorrect.
            </p>
          </div>
          <Link href="/">
            <button className="px-6 py-2.5 rounded-lg bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white text-sm font-medium transition-colors">
              Go to Diagravix AI
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-[#f7f8ff] flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0d1018]/70 backdrop-blur-md px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#7c5cff] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#f7f8ff] leading-tight">
              {diagram?.title || "Shared Diagram"}
            </h1>
            <p className="text-[10px] text-[#677086]">
              Read-only · Shared via Diagravix AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Diagram meta */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-[#677086]">
            <span>{diagram?.nodes?.length ?? 0} nodes</span>
            <span>{diagram?.edges?.length ?? 0} edges</span>
            <span className="capitalize bg-white/5 px-2 py-0.5 rounded">
              {diagram?.diagramType?.replace("_", " ") ?? "flowchart"}
            </span>
          </div>

          <Link href="/">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c5cff]/10 hover:bg-[#7c5cff]/20 border border-[#7c5cff]/20 text-[#7c5cff] text-xs font-medium transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Create yours
            </button>
          </Link>
        </div>
      </header>

      {/* Read-only Badge */}
      <div className="flex-shrink-0 px-6 py-2 border-b border-white/5 bg-[#07080d]/50">
        <div className="flex items-center gap-2 text-xs text-[#677086]">
          <Lock className="w-3 h-3" />
          <span>Read-only view — you cannot edit this diagram</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#ffffff" style={{ opacity: 0.03 }} gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-[#0d1018] !border-white/5 !text-white [&_button]:!border-white/5 [&_button]:!bg-[#07080d] [&_svg]:!fill-white"
          />
          <MiniMap
            nodeColor={() => "#7c5cff"}
            maskColor="rgba(7, 8, 13, 0.7)"
            className="!bg-[#0d1018] !border-white/5"
          />
        </ReactFlow>

        {/* Description overlay */}
        {diagram?.description && (
          <div className="absolute bottom-4 left-4 max-w-sm bg-[#0d1018]/80 backdrop-blur-md border border-white/5 rounded-xl px-4 py-3 text-xs text-[#a5adc2] pointer-events-none">
            <p className="font-semibold text-[#f7f8ff] mb-1">About this diagram</p>
            <p className="line-clamp-3">{diagram.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080d] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#7c5cff] animate-spin" />
        </div>
      }
    >
      <SharePageContent />
    </Suspense>
  )
}
