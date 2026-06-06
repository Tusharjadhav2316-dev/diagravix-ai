"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Script from "next/script"
import { Suspense } from "react"
import DiagramEditor from "@/components/diagram-editor"
import ExportToolbar from "@/components/export-toolbar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { useDashboardStore } from "@/stores/dashboard-store"
import { useEditorStore } from "@/stores/editor-store"
import { toast } from "sonner"
import {
  Save,
  LayoutDashboard,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import type { Diagram } from "@/types/diagram"

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diagramId = searchParams.get("id")

  const { user } = useAuthStore()
  const { upsertDiagram, loadDiagram, saving, currentDiagramId, setCurrentDiagramId } = useDashboardStore()
  const diagram = useEditorStore((s) => s.diagram)
  const isDirty = useEditorStore((s) => s.isDirty)
  const markSaved = useEditorStore((s) => s.markSaved)
  const setDiagram = useEditorStore((s) => s.setDiagram)

  const [mode, setMode] = useState<"draw" | "generate">("generate")
  const [threeLoaded, setThreeLoaded] = useState(false)
  const [vantaLoaded, setVantaLoaded] = useState(false)
  const [loadingDiagram, setLoadingDiagram] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Canvas container ref — passed to ExportToolbar for html-to-image
  const flowContainerRef = useRef<HTMLDivElement>(null)

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load diagram from URL param
  useEffect(() => {
    if (diagramId && user?.uid) {
      setLoadingDiagram(true)
      loadDiagram(diagramId, user.uid).then((saved) => {
        if (saved) {
          setDiagram(saved.data)
          setCurrentDiagramId(diagramId)
          toast.success(`Loaded: ${saved.title}`)
        } else {
          toast.error("Diagram not found.")
        }
        setLoadingDiagram(false)
      })
    }
  }, [diagramId, user?.uid])

  // Vanta.js background
  useEffect(() => {
    let vantaEffect: any = null
    if (vantaLoaded && typeof window !== "undefined" && (window as any).VANTA?.CLOUDS2) {
      try {
        vantaEffect = (window as any).VANTA.CLOUDS2({
          el: "#vanta-canvas-bg",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          backgroundColor: 0x0,
          skyColor: 0x5ca6ca,
          cloudColor: 0x334d80,
          lightColor: 0xffffff,
          speed: 0.6,
          texturePath: "https://raw.githubusercontent.com/tengbao/vanta/master/gallery/noise.png",
        })
      } catch (err) {
        console.warn("[Vanta] Failed to initialize:", err)
      }
    }
    return () => { if (vantaEffect) vantaEffect.destroy() }
  }, [vantaLoaded])

  // Manual save
  const handleSave = useCallback(async () => {
    if (!diagram || !user?.uid) {
      if (!user) toast.error("Please sign in to save diagrams.")
      return
    }
    const id = await upsertDiagram(user.uid, diagram, currentDiagramId, diagram.title)
    if (id) {
      markSaved()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      toast.success("Diagram saved!")
      if (!currentDiagramId) {
        router.replace(`/editor?id=${id}`, { scroll: false })
      }
    }
  }, [diagram, user?.uid, currentDiagramId, upsertDiagram, markSaved, router])

  // Autosave: 4s debounce
  useEffect(() => {
    if (!isDirty || !diagram || !user?.uid) return
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(async () => {
      const id = await upsertDiagram(user.uid!, diagram, currentDiagramId, diagram.title)
      if (id) {
        markSaved()
        if (!currentDiagramId) router.replace(`/editor?id=${id}`, { scroll: false })
      }
    }, 4000)
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current) }
  }, [isDirty, diagram, user?.uid, currentDiagramId])

  // JSON Import handler
  const handleImport = (imported: Diagram) => {
    setDiagram({
      ...imported,
      id: imported.id || `imported-${Date.now()}`,
      createdAt: imported.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <main className="min-h-screen bg-[#07080d] text-[#f7f8ff] relative overflow-hidden font-sans antialiased">
      <div id="vanta-canvas-bg" className="fixed inset-0 z-0 pointer-events-none opacity-20" />
      <div className="fixed inset-0 bg-[#07080d]/80 z-0 pointer-events-none" />

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js"
        strategy="lazyOnload"
        onLoad={() => setThreeLoaded(true)}
      />
      {threeLoaded && (
        <Script
          src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds2.min.js"
          strategy="lazyOnload"
          onLoad={() => setVantaLoaded(true)}
        />
      )}

      <div className="flex flex-col h-screen relative z-10">
        {/* Header */}
        <div className="border-b border-white/5 bg-[#0d1018]/50 backdrop-blur-md px-4 py-2.5">
          <div className="flex justify-between items-center gap-4">
            {/* Left: Logo + title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#7c5cff] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-[#f7f8ff] leading-tight truncate max-w-48">
                  {diagram?.title || "Diagram Editor"}
                </h1>
                <p className="text-[10px] text-[#677086]">
                  {saving ? "Saving..." : isDirty ? "Unsaved changes" : saveSuccess ? "✓ Saved" : "All changes saved"}
                </p>
              </div>
            </div>

            {/* Center: Mode toggle */}
            <div className="flex items-center gap-1 bg-[#0d1018]/60 border border-white/5 rounded-lg p-1 flex-shrink-0">
              <Button
                onClick={() => setMode("generate")}
                className={`text-xs px-3 h-7 rounded-md ${
                  mode === "generate"
                    ? "bg-[#7c5cff] text-white hover:bg-[#7c5cff]/90"
                    : "text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 bg-transparent"
                }`}
              >
                AI Generate
              </Button>
              <Button
                onClick={() => setMode("draw")}
                className={`text-xs px-3 h-7 rounded-md ${
                  mode === "draw"
                    ? "bg-[#7c5cff] text-white hover:bg-[#7c5cff]/90"
                    : "text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 bg-transparent"
                }`}
              >
                Manual Draw
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Save indicator */}
              {saving && (
                <div className="flex items-center gap-1.5 text-xs text-[#677086]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </div>
              )}
              {saveSuccess && !saving && (
                <div className="flex items-center gap-1.5 text-xs text-[#22c55e]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Saved</span>
                </div>
              )}

              {/* Export + Share Toolbar */}
              <ExportToolbar
                diagram={diagram}
                flowContainerRef={flowContainerRef}
                currentDiagramId={currentDiagramId}
                onImport={handleImport}
              />

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving || !diagram}
                size="sm"
                className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white text-xs h-8 px-3 gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Save</span>
              </Button>

              {user && (
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 text-xs h-8 px-3 gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loadingDiagram && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#7c5cff] animate-spin mx-auto" />
              <p className="text-sm text-[#677086]">Loading diagram...</p>
            </div>
          </div>
        )}

        {/* Editor with canvas ref */}
        {!loadingDiagram && (
          <div ref={flowContainerRef} className="flex-1 overflow-hidden">
            <DiagramEditor mode={mode} />
          </div>
        )}
      </div>
    </main>
  )
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080d] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#7c5cff] animate-spin" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
