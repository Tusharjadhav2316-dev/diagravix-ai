"use client"

import { Button } from "@/components/ui/button"
import type { GeneratedDiagram } from "@/lib/diagram-generator"
import { Trash2 } from "lucide-react"

interface PropertiesPanelProps {
  diagram: GeneratedDiagram
  selectedNodeId: string | null
  onUpdateNode: (id: string, updates: Record<string, unknown>) => void
  onDeleteNode: (id: string) => void
  onAddNode: () => void
  onConnect: (sourceId: string, targetId: string) => void
}

export default function PropertiesPanel({
  diagram,
  selectedNodeId,
  onUpdateNode,
  onDeleteNode,
  onAddNode,
  onConnect,
}: PropertiesPanelProps) {
  const selectedNode = selectedNodeId ? diagram.nodes.find((n) => n.id === selectedNodeId) : null

  return (
    <div className="w-72 border-l border-border bg-card p-4 overflow-y-auto">
      {selectedNode ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Node Properties</h3>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Label</label>
            <input
              type="text"
              value={selectedNode.label}
              onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
              className="w-full mt-1 px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <select
              value={selectedNode.type}
              onChange={(e) => onUpdateNode(selectedNode.id, { type: e.target.value })}
              className="w-full mt-1 px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
            >
              <option value="process">Process</option>
              <option value="data">Data</option>
              <option value="decision">Decision</option>
              <option value="entity">Entity</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">X</label>
              <input
                type="number"
                value={selectedNode.x}
                onChange={(e) => onUpdateNode(selectedNode.id, { x: Number.parseInt(e.target.value) })}
                className="w-full mt-1 px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Y</label>
              <input
                type="number"
                value={selectedNode.y}
                onChange={(e) => onUpdateNode(selectedNode.id, { y: Number.parseInt(e.target.value) })}
                className="w-full mt-1 px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Connect to:</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {diagram.nodes
                .filter((n) => n.id !== selectedNodeId)
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => selectedNodeId && onConnect(selectedNodeId, node.id)}
                    className="w-full text-left text-xs px-2 py-1 rounded bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {node.label}
                  </button>
                ))}
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => selectedNodeId && onDeleteNode(selectedNodeId)}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </Button>
        </div>
      ) : (
        <div className="text-center text-muted-foreground space-y-4">
          <p className="text-sm">Select a node to edit properties</p>
          <Button onClick={onAddNode} size="sm" className="w-full">
            Add Node
          </Button>
        </div>
      )}
    </div>
  )
}
