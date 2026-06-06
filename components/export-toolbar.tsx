"use client"

/**
 * ExportToolbar — Premium export + share panel for the diagram editor.
 * Connects to the React Flow canvas via ref for pixel-perfect exports.
 */
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  FileJson,
  FileCode,
  ImageIcon,
  FileText,
  Share2,
  Copy,
  Check,
  ChevronDown,
  Upload,
  Globe,
  Lock,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  exportFlowToPNG,
  exportFlowToSVG,
  exportFlowToPDF,
  exportFlowToJSON,
  exportToMermaidFile,
  exportToPlantUMLFile,
  importFromJSON,
} from "@/lib/export/react-flow-export"
import type { Diagram } from "@/types/diagram"
import { useAuthStore } from "@/stores/auth-store"
import { useDashboardStore } from "@/stores/dashboard-store"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/client"

interface ExportToolbarProps {
  diagram: Diagram | null
  flowContainerRef: React.RefObject<HTMLDivElement | null>
  currentDiagramId?: string | null
  onImport: (diagram: Diagram) => void
}

type ExportSection = "export" | "share" | null

export default function ExportToolbar({
  diagram,
  flowContainerRef,
  currentDiagramId,
  onImport,
}: ExportToolbarProps) {
  const { user } = useAuthStore()
  const { upsertDiagram } = useDashboardStore()
  const [activeSection, setActiveSection] = useState<ExportSection>(null)
  const [exporting, setExporting] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [visibility, setVisibility] = useState<"private" | "public">(
    diagram?.visibility ?? "private"
  )
  const [updatingVisibility, setUpdatingVisibility] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const getFlowElement = useCallback((): HTMLElement | null => {
    // Target the React Flow wrapper (the pane that holds all nodes)
    return flowContainerRef.current?.querySelector(".react-flow") as HTMLElement | null
  }, [flowContainerRef])

  const handleExport = async (format: string) => {
    if (!diagram) {
      toast.error("No diagram to export.")
      return
    }

    const el = getFlowElement()
    const name = diagram.title || "diagram"

    setExporting(format)
    try {
      switch (format) {
        case "png":
          if (!el) throw new Error("Canvas not found")
          await exportFlowToPNG(el, name, 2)
          toast.success("PNG exported at 2x resolution!")
          break
        case "png-hq":
          if (!el) throw new Error("Canvas not found")
          await exportFlowToPNG(el, name, 3)
          toast.success("PNG exported at 3x (print quality)!")
          break
        case "svg":
          if (!el) throw new Error("Canvas not found")
          await exportFlowToSVG(el, name)
          toast.success("SVG exported!")
          break
        case "pdf":
          if (!el) throw new Error("Canvas not found")
          await exportFlowToPDF(el, name)
          toast.success("PDF exported!")
          break
        case "json":
          exportFlowToJSON(diagram, name)
          toast.success("JSON exported!")
          break
        case "mermaid":
          exportToMermaidFile(diagram, name)
          toast.success("Mermaid (.mmd) exported!")
          break
        case "plantuml":
          exportToPlantUMLFile(diagram, name)
          toast.success("PlantUML (.puml) exported!")
          break
      }
    } catch (err: any) {
      toast.error("Export failed: " + (err.message ?? "Unknown error"))
    } finally {
      setExporting(null)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importFromJSON(file)
      onImport(imported)
      toast.success(`Imported: ${imported.title || "Diagram"}`)
    } catch (err: any) {
      toast.error("Import failed: " + err.message)
    }
    // Reset input so same file can be re-imported
    e.target.value = ""
  }

  const handleCopyShareLink = async () => {
    if (!currentDiagramId) {
      toast.error("Save the diagram first to get a share link.")
      return
    }
    const url = `${window.location.origin}/share/${currentDiagramId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Share link copied to clipboard!")
    setTimeout(() => setCopied(false), 3000)
  }

  const handleToggleVisibility = async () => {
    if (!currentDiagramId || !user?.uid) {
      toast.error("Save the diagram first to change visibility.")
      return
    }

    const newVisibility = visibility === "private" ? "public" : "private"
    setUpdatingVisibility(true)
    try {
      await updateDoc(doc(db, "diagrams", currentDiagramId), {
        visibility: newVisibility,
        "data.visibility": newVisibility,
      })
      setVisibility(newVisibility)
      toast.success(
        newVisibility === "public"
          ? "Diagram is now public — share the link!"
          : "Diagram is now private."
      )
    } catch (err: any) {
      toast.error("Failed to update visibility.")
    } finally {
      setUpdatingVisibility(false)
    }
  }

  const toggleSection = (section: ExportSection) => {
    setActiveSection((prev) => (prev === section ? null : section))
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Hidden file input for JSON import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />

      {/* Import Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => importInputRef.current?.click()}
        className="border-white/10 text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 text-xs h-8 px-3 gap-1.5"
      >
        <Upload className="w-3.5 h-3.5" />
        Import
      </Button>

      {/* Export Button */}
      <div className="relative">
        <Button
          size="sm"
          onClick={() => toggleSection("export")}
          className="bg-[#0d1018] border border-white/10 text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 text-xs h-8 px-3 gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export
          <ChevronDown
            className={`w-3 h-3 transition-transform ${activeSection === "export" ? "rotate-180" : ""}`}
          />
        </Button>

        <AnimatePresence>
          {activeSection === "export" && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-56 bg-[#0d1018] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Image Formats */}
              <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#677086] font-semibold border-b border-white/5">
                Image Formats
              </div>
              {[
                { id: "png", label: "PNG — Standard (2x)", icon: <ImageIcon className="w-3.5 h-3.5" /> },
                { id: "png-hq", label: "PNG — Print Quality (3x)", icon: <ImageIcon className="w-3.5 h-3.5" /> },
                { id: "svg", label: "SVG — Vector", icon: <ImageIcon className="w-3.5 h-3.5" /> },
                { id: "pdf", label: "PDF — Document", icon: <FileText className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleExport(item.id)}
                  disabled={exporting === item.id}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 transition-colors text-left"
                >
                  {exporting === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7c5cff]" />
                  ) : (
                    <span className="text-[#677086]">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              ))}

              {/* Code Formats */}
              <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#677086] font-semibold border-t border-b border-white/5 mt-1">
                Code Formats
              </div>
              {[
                { id: "mermaid", label: "Mermaid (.mmd)", icon: <FileCode className="w-3.5 h-3.5" /> },
                { id: "plantuml", label: "PlantUML (.puml)", icon: <FileCode className="w-3.5 h-3.5" /> },
                { id: "json", label: "JSON Data (.json)", icon: <FileJson className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleExport(item.id)}
                  disabled={exporting === item.id}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 transition-colors text-left"
                >
                  {exporting === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7c5cff]" />
                  ) : (
                    <span className="text-[#677086]">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share Button */}
      <div className="relative">
        <Button
          size="sm"
          onClick={() => toggleSection("share")}
          className="bg-[#7c5cff]/10 border border-[#7c5cff]/30 text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-[#7c5cff]/20 text-xs h-8 px-3 gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5 text-[#7c5cff]" />
          Share
          <ChevronDown
            className={`w-3 h-3 transition-transform ${activeSection === "share" ? "rotate-180" : ""}`}
          />
        </Button>

        <AnimatePresence>
          {activeSection === "share" && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-72 bg-[#0d1018] border border-white/10 rounded-xl shadow-2xl p-4 space-y-4"
            >
              {/* Visibility Toggle */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-[#677086] font-semibold">
                  Visibility
                </p>
                <button
                  onClick={handleToggleVisibility}
                  disabled={updatingVisibility}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 bg-[#07080d] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    {visibility === "public" ? (
                      <Globe className="w-4 h-4 text-[#22c55e]" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#677086]" />
                    )}
                    <div className="text-left">
                      <p className="text-xs font-semibold text-[#f7f8ff]">
                        {visibility === "public" ? "Public" : "Private"}
                      </p>
                      <p className="text-[10px] text-[#677086]">
                        {visibility === "public"
                          ? "Anyone with the link can view"
                          : "Only you can see this diagram"}
                      </p>
                    </div>
                  </div>
                  {updatingVisibility ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#677086]" />
                  ) : (
                    <div
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        visibility === "public" ? "bg-[#22c55e]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          visibility === "public" ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  )}
                </button>
              </div>

              {/* Share Link */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-[#677086] font-semibold">
                  Share Link
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#07080d] border border-white/5 rounded-lg px-3 py-2 text-xs text-[#677086] truncate font-mono">
                    {currentDiagramId
                      ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${currentDiagramId}`
                      : "Save diagram first..."}
                  </div>
                  <button
                    onClick={handleCopyShareLink}
                    className="flex-shrink-0 p-2 rounded-lg bg-[#7c5cff]/10 hover:bg-[#7c5cff]/20 border border-[#7c5cff]/20 transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#7c5cff]" />
                    )}
                  </button>
                </div>
                {visibility === "private" && currentDiagramId && (
                  <p className="text-[10px] text-yellow-500/80 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Set to Public for others to view via this link
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close overlay when clicking outside */}
      {activeSection && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveSection(null)}
        />
      )}
    </div>
  )
}
