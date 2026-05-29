import { create } from "zustand"
import type { Diagram, DiagramEdge, DiagramNode } from "@/types/diagram"

interface EditorState {
  diagram: Diagram | null
  selectedNodeIds: string[]
  selectedEdgeIds: string[]
  isDirty: boolean
  setDiagram: (diagram: Diagram | null) => void
  updateNode: (nodeId: string, updates: Partial<DiagramNode>) => void
  updateEdge: (edgeId: string, updates: Partial<DiagramEdge>) => void
  setSelectedNodeIds: (nodeIds: string[]) => void
  setSelectedEdgeIds: (edgeIds: string[]) => void
  markSaved: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  diagram: null,
  selectedNodeIds: [],
  selectedEdgeIds: [],
  isDirty: false,
  setDiagram: (diagram) =>
    set({
      diagram,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      isDirty: false,
    }),
  updateNode: (nodeId, updates) =>
    set((state) => {
      if (!state.diagram) return state

      return {
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((node) =>
            node.id === nodeId ? { ...node, ...updates } : node,
          ),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }
    }),
  updateEdge: (edgeId, updates) =>
    set((state) => {
      if (!state.diagram) return state

      return {
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === edgeId ? { ...edge, ...updates } : edge,
          ),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }
    }),
  setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),
  setSelectedEdgeIds: (selectedEdgeIds) => set({ selectedEdgeIds }),
  markSaved: () => set({ isDirty: false }),
}))
