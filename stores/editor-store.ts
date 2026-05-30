import { create } from "zustand"
import type { Diagram, DiagramEdge, DiagramNode } from "@/types/diagram"

interface EditorState {
  diagram: Diagram | null
  past: Diagram[]
  future: Diagram[]
  selectedNodeIds: string[]
  selectedEdgeIds: string[]
  isDirty: boolean
  setDiagram: (diagram: Diagram | null) => void
  updateNode: (nodeId: string, updates: Partial<DiagramNode>) => void
  updateEdge: (edgeId: string, updates: Partial<DiagramEdge>) => void
  addNode: (node: DiagramNode) => void
  addEdge: (edge: DiagramEdge) => void
  deleteElements: (nodeIds: string[], edgeIds: string[]) => void
  setSelectedNodeIds: (nodeIds: string[]) => void
  setSelectedEdgeIds: (edgeIds: string[]) => void
  undo: () => void
  redo: () => void
  markSaved: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  diagram: null,
  past: [],
  future: [],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  isDirty: false,

  setDiagram: (diagram) =>
    set({
      diagram,
      past: [],
      future: [],
      selectedNodeIds: [],
      selectedEdgeIds: [],
      isDirty: false,
    }),

  updateNode: (nodeId, updates) =>
    set((state) => {
      if (!state.diagram) return state

      // Push current to past, clear future
      const newPast = [...state.past, state.diagram]

      return {
        past: newPast,
        future: [],
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

      // Push current to past, clear future
      const newPast = [...state.past, state.diagram]

      return {
        past: newPast,
        future: [],
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

  addNode: (node) =>
    set((state) => {
      if (!state.diagram) return state

      const newPast = [...state.past, state.diagram]
      return {
        past: newPast,
        future: [],
        diagram: {
          ...state.diagram,
          nodes: [...state.diagram.nodes, node],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }
    }),

  addEdge: (edge) =>
    set((state) => {
      if (!state.diagram) return state

      const newPast = [...state.past, state.diagram]
      return {
        past: newPast,
        future: [],
        diagram: {
          ...state.diagram,
          edges: [...state.diagram.edges, edge],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }
    }),

  deleteElements: (nodeIds, edgeIds) =>
    set((state) => {
      if (!state.diagram) return state

      const newPast = [...state.past, state.diagram]
      return {
        past: newPast,
        future: [],
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.filter((node) => !nodeIds.includes(node.id)),
          edges: state.diagram.edges.filter(
            (edge) => !edgeIds.includes(edge.id) && !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
          ),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
        selectedNodeIds: state.selectedNodeIds.filter(id => !nodeIds.includes(id)),
        selectedEdgeIds: state.selectedEdgeIds.filter(id => !edgeIds.includes(id)),
      }
    }),

  setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),
  setSelectedEdgeIds: (selectedEdgeIds) => set({ selectedEdgeIds }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0 || !state.diagram) return state

      const newPast = [...state.past]
      const previous = newPast.pop()!
      const newFuture = [state.diagram, ...state.future]

      return {
        past: newPast,
        future: newFuture,
        diagram: previous,
        isDirty: true,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0 || !state.diagram) return state

      const newFuture = [...state.future]
      const next = newFuture.shift()!
      const newPast = [...state.past, state.diagram]

      return {
        past: newPast,
        future: newFuture,
        diagram: next,
        isDirty: true,
      }
    }),

  markSaved: () => set({ isDirty: false }),
}))
