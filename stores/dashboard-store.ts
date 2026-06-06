import { create } from "zustand"
import {
  listUserDiagrams,
  saveDiagram as svcSaveDiagram,
  updateDiagram as svcUpdateDiagram,
  deleteDiagram as svcDeleteDiagram,
  loadDiagram as svcLoadDiagram,
  upsertDiagram as svcUpsertDiagram,
  type DiagramListItem,
  type SavedDiagram,
} from "@/services/diagram-service"
import type { Diagram } from "@/types/diagram"

interface DashboardState {
  diagrams: DiagramListItem[]
  currentDiagramId: string | null
  loading: boolean
  saving: boolean
  error: string | null

  fetchDiagrams: (uid: string) => Promise<void>
  saveDiagram: (uid: string, diagram: Diagram, title?: string) => Promise<string | null>
  updateDiagram: (diagramId: string, uid: string, diagram: Diagram, title?: string) => Promise<void>
  upsertDiagram: (uid: string, diagram: Diagram, diagramId?: string | null, title?: string) => Promise<string | null>
  deleteDiagram: (diagramId: string, uid: string) => Promise<void>
  loadDiagram: (diagramId: string, uid: string) => Promise<SavedDiagram | null>
  setCurrentDiagramId: (id: string | null) => void
  clearError: () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  diagrams: [],
  currentDiagramId: null,
  loading: false,
  saving: false,
  error: null,

  fetchDiagrams: async (uid) => {
    set({ loading: true, error: null })
    try {
      const diagrams = await listUserDiagrams(uid, 20)
      set({ diagrams, loading: false })
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load diagrams.", loading: false })
    }
  },

  saveDiagram: async (uid, diagram, title) => {
    set({ saving: true, error: null })
    try {
      const id = await svcSaveDiagram(uid, diagram, title)
      set({ currentDiagramId: id, saving: false })
      // Refresh list
      get().fetchDiagrams(uid)
      return id
    } catch (err: any) {
      set({ error: err.message ?? "Failed to save diagram.", saving: false })
      return null
    }
  },

  updateDiagram: async (diagramId, uid, diagram, title) => {
    set({ saving: true, error: null })
    try {
      await svcUpdateDiagram(diagramId, uid, diagram, title)
      set({ saving: false })
      get().fetchDiagrams(uid)
    } catch (err: any) {
      set({ error: err.message ?? "Failed to update diagram.", saving: false })
    }
  },

  upsertDiagram: async (uid, diagram, diagramId, title) => {
    set({ saving: true, error: null })
    try {
      const id = await svcUpsertDiagram(uid, diagram, diagramId, title)
      set({ currentDiagramId: id, saving: false })
      get().fetchDiagrams(uid)
      return id
    } catch (err: any) {
      set({ error: err.message ?? "Failed to save diagram.", saving: false })
      return null
    }
  },

  deleteDiagram: async (diagramId, uid) => {
    set({ error: null })
    try {
      await svcDeleteDiagram(diagramId, uid)
      set((state) => ({
        diagrams: state.diagrams.filter((d) => d.id !== diagramId),
        currentDiagramId: state.currentDiagramId === diagramId ? null : state.currentDiagramId,
      }))
    } catch (err: any) {
      set({ error: err.message ?? "Failed to delete diagram." })
    }
  },

  loadDiagram: async (diagramId, uid) => {
    set({ loading: true, error: null })
    try {
      const saved = await svcLoadDiagram(diagramId, uid)
      if (saved) {
        set({ currentDiagramId: diagramId, loading: false })
      } else {
        set({ loading: false })
      }
      return saved
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load diagram.", loading: false })
      return null
    }
  },

  setCurrentDiagramId: (id) => set({ currentDiagramId: id }),
  clearError: () => set({ error: null }),
}))
