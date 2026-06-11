// components/editor-canvas.tsx
"use client"

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  type Ref,
  useCallback
} from "react"
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodeDrag,
  type NodeMouseHandler
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import CustomNode from "./custom-node"
import { useEditorStore } from "@/stores/editor-store"

type NodeShape = {
  id: string
  x?: number
  y?: number
  width?: number
  height?: number
  text?: string
  label?: string
  type?: string
}

export type GeneratedDiagram = {
  nodes?: NodeShape[]
  edges?: Array<{ id?: string; source: string; target: string; relationship?: string; label?: string }>
}

export interface EditorCanvasHandle {
  exportPNG: (opts?: { pixelRatio?: number }) => string | null
}

interface EditorCanvasProps {
  diagram: GeneratedDiagram | null
  selectedNodeId?: string | null
  onSelectNode?: (id: string | null) => void
  onUpdateNode?: (id: string, updates: Partial<NodeShape>) => void
  onAddNode?: () => void
  className?: string
  style?: React.CSSProperties
}

const nodeTypes = {
  customNode: CustomNode
}

const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(function EditorCanvas(
  { diagram: propDiagram, onSelectNode, onUpdateNode, onAddNode, className, style },
  ref: Ref<EditorCanvasHandle>
) {
  // Sync with Zustand store if available (in editor workspace)
  const storeDiagram = useEditorStore((state) => state.diagram)
  const storeUpdateNode = useEditorStore((state) => state.updateNode)
  const storeAddEdge = useEditorStore((state) => state.addEdge)
  const storeSelectedNodeIds = useEditorStore((state) => state.setSelectedNodeIds)

  // Use props if store is empty (e.g., landing page live demo)
  const activeDiagram = storeDiagram || propDiagram

  // Convert schema nodes to React Flow Node type
  const initialNodes: Node[] = useMemo(() => {
    if (!activeDiagram?.nodes) return []
    return activeDiagram.nodes.map((n: any) => ({
      id: n.id,
      type: "customNode",
      position: n.position || { x: n.x ?? 100, y: n.y ?? 100 },
      data: { 
        label: n.label || n.text || n.id, 
        type: n.type || "process",
        width: n.width || 150,
        height: n.height || 60
      }
    }))
  }, [activeDiagram?.nodes])

  // Convert schema edges to React Flow Edge type
  const initialEdges: Edge[] = useMemo(() => {
    if (!activeDiagram?.edges) return []
    return activeDiagram.edges.map((e: any, index) => ({
      id: e.id || `edge-${e.source}-${e.target}-${index}`,
      source: e.source,
      target: e.target,
      label: e.relationship || e.label || "",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#7c5cff"
      },
      style: {
        stroke: "#7c5cff",
        strokeWidth: 2
      }
    }))
  }, [activeDiagram?.edges])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Sync state when nodes/edges lists change from props/store updates
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Export handlers
  useImperativeHandle(
    ref,
    () => ({
      exportPNG: () => {
        // Returns placeholder or handles rendering URL
        return ""
      }
    }),
    []
  )

  // Handle Drag Position updates
  const handleNodeDragStop = useCallback<OnNodeDrag<Node>>(
    (_event, node, _nodes) => {
      const position = node.position
      if (storeDiagram) {
        storeUpdateNode(node.id, { 
          position: { x: position.x, y: position.y }
        } as any)
      } else if (onUpdateNode) {
        onUpdateNode(node.id, { x: position.x, y: position.y })
      }
    },
    [storeDiagram, storeUpdateNode, onUpdateNode]
  )

  // Handle Selection updates
  const handleNodeClick = useCallback<NodeMouseHandler<Node>>(
    (_event, node) => {
      if (storeDiagram) {
        storeSelectedNodeIds([node.id])
      }
      onSelectNode?.(node.id)
    },
    [storeDiagram, storeSelectedNodeIds, onSelectNode]
  )

  const handlePaneClick = useCallback(
    () => {
      if (storeDiagram) {
        storeSelectedNodeIds([])
      }
      onSelectNode?.(null)
    },
    [storeDiagram, storeSelectedNodeIds, onSelectNode]
  )

  // Handle new Edge Connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#7c5cff"
        },
        style: {
          stroke: "#7c5cff",
          strokeWidth: 2
        }
      }

      setEdges((eds) => addEdge(connection, eds))

      if (storeDiagram) {
        storeAddEdge({
          id: newEdge.id,
          source: connection.source,
          target: connection.target,
          label: ""
        })
      }
    },
    [storeDiagram, storeAddEdge, setEdges]
  )

  return (
    <div className={className} style={{ width: "100%", height: "100%", position: "relative", ...style }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
      >
        <Background color="#ffffff" style={{ opacity: 0.03 }} gap={20} size={1} />
        <Controls className="!bg-[#0d1018] !border-white/5 !text-white [&_button]:!border-white/5 [&_button]:!bg-[#07080d] [&_svg]:!fill-white" />
        <MiniMap 
          nodeColor={() => "#7c5cff"} 
          maskColor="rgba(7, 8, 13, 0.7)" 
          className="!bg-[#0d1018] !border-white/5"
        />
      </ReactFlow>
    </div>
  )
})

EditorCanvas.displayName = "EditorCanvas"
export default EditorCanvas
