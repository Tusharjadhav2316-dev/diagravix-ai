"use client"

import React, { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Database, HelpCircle, Box, Circle, Play, Square } from "lucide-react"

// Types of shapes supported by Diagravix
export type NodeShapeType = 
  | "process" 
  | "decision" 
  | "start" 
  | "end" 
  | "database" 
  | "actor" 
  | "interface" 
  | "component" 
  | "generic"

interface CustomNodeData {
  label: string
  type?: NodeShapeType
  selected?: boolean
  width?: number
  height?: number
}

const CustomNode = memo(({ data, selected }: NodeProps & { data: CustomNodeData }) => {
  const shapeType = data.type || "process"
  const labelText = data.label || "Node"

  // Render shape wrapper
  const getShapeStyles = () => {
    switch (shapeType) {
      case "start":
      case "end":
        return "rounded-full border-[#7c5cff] bg-[#7c5cff]/10 text-[#f7f8ff]"
      case "decision":
        return "rotate-45 border-yellow-500/50 bg-yellow-500/10 text-[#f7f8ff] aspect-square"
      case "database":
        return "rounded-md border-[#22c55e] bg-[#22c55e]/10 text-[#f7f8ff] border-t-4 border-b-4"
      case "actor":
        return "rounded-full aspect-square border-[#22d3ee] bg-[#22d3ee]/10 text-[#f7f8ff] max-w-[80px]"
      case "component":
      case "interface":
        return "rounded-none border-blue-500/50 bg-blue-500/10 text-[#f7f8ff]"
      case "process":
      default:
        return "rounded-lg border-white/10 bg-[#0d1018]/90 text-[#f7f8ff]"
    }
  }

  // Render icon inside node
  const getIcon = () => {
    switch (shapeType) {
      case "start":
        return <Play className="w-3.5 h-3.5 text-[#7c5cff]" />
      case "database":
        return <Database className="w-3.5 h-3.5 text-[#22c55e]" />
      case "decision":
        return <HelpCircle className="w-3.5 h-3.5 text-yellow-500 -rotate-45" />
      case "actor":
        return <Circle className="w-3.5 h-3.5 text-[#22d3ee]" />
      case "component":
        return <Box className="w-3.5 h-3.5 text-blue-400" />
      default:
        return <Square className="w-3.5 h-3.5 text-[#a5adc2]" />
    }
  }

  return (
    <div 
      className={`min-w-[150px] min-h-[60px] p-3 flex flex-col justify-center items-center gap-1.5 border text-center transition-all ${getShapeStyles()} ${
        selected ? "ring-2 ring-[#7c5cff] ring-offset-2 ring-offset-[#07080d] border-transparent" : "shadow-md"
      }`}
      style={{
        width: data.width ? `${data.width}px` : "auto",
        height: data.height ? `${data.height}px` : "auto",
      }}
    >
      {/* Target/Source handles in all directions */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#7c5cff] border-none" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#7c5cff] border-none" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-[#22d3ee] border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-[#22d3ee] border-none" />

      {/* Node content */}
      <div className={`flex items-center gap-1.5 ${shapeType === "decision" ? "-rotate-45" : ""}`}>
        {getIcon()}
        <span className="text-xs font-semibold select-none">{labelText}</span>
      </div>
    </div>
  )
})

CustomNode.displayName = "CustomNode"
export default CustomNode
