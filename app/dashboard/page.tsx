"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  LayoutDashboard,
  Clock,
  Activity,
  FileText,
  Search,
  LogOut,
  GitBranch,
  Database,
  Cpu,
  Layers,
  ExternalLink,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useDashboardStore } from "@/stores/dashboard-store"
import { useEditorStore } from "@/stores/editor-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const DIAGRAM_ICONS: Record<string, React.ReactNode> = {
  flowchart: <GitBranch className="w-5 h-5 text-[#7c5cff]" />,
  erd: <Database className="w-5 h-5 text-[#22d3ee]" />,
  sequence: <Layers className="w-5 h-5 text-[#22c55e]" />,
  class: <Cpu className="w-5 h-5 text-orange-400" />,
  default: <FileText className="w-5 h-5 text-[#677086]" />,
}

const DIAGRAM_COLORS: Record<string, string> = {
  flowchart: "from-[#7c5cff]/20 to-[#7c5cff]/5 border-[#7c5cff]/20",
  erd: "from-[#22d3ee]/20 to-[#22d3ee]/5 border-[#22d3ee]/20",
  sequence: "from-[#22c55e]/20 to-[#22c55e]/5 border-[#22c55e]/20",
  class: "from-orange-400/20 to-orange-400/5 border-orange-400/20",
  default: "from-white/5 to-white/2 border-white/10",
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, logoutUser, loading: authLoading } = useAuthStore()
  const { diagrams, loading, fetchDiagrams, deleteDiagram } = useDashboardStore()
  const setDiagram = useEditorStore((s) => s.setDiagram)
  const [search, setSearch] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.uid) {
      fetchDiagrams(user.uid)
    }
  }, [user?.uid, fetchDiagrams])

  const handleLogout = async () => {
    await logoutUser()
    toast.success("Signed out successfully.")
    router.replace("/")
  }

  const handleDelete = async (diagramId: string) => {
    if (!user?.uid) return
    await deleteDiagram(diagramId, user.uid)
    setDeleteConfirm(null)
    toast.success("Diagram deleted.")
  }

  const handleOpenDiagram = (diagram: any) => {
    // Navigate to editor with diagram ID
    router.push(`/editor?id=${diagram.id}`)
  }

  const filteredDiagrams = diagrams.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.diagramType.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#07080d] text-[#f7f8ff] font-sans antialiased">
      {/* Gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7c5cff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#22d3ee]/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <div className="flex min-h-screen relative z-10">
        <aside className="w-64 border-r border-white/5 bg-[#0d1018]/60 backdrop-blur-md flex flex-col p-4 gap-2 fixed h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#7c5cff] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Diagravix AI</span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1">
            <div className="px-2 py-1.5 rounded-lg bg-white/5 flex items-center gap-3 text-sm font-semibold text-[#f7f8ff]">
              <LayoutDashboard className="w-4 h-4 text-[#7c5cff]" />
              Dashboard
            </div>
            <Link
              href="/editor"
              className="px-2 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-3 text-sm text-[#a5adc2] hover:text-[#f7f8ff] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Diagram
            </Link>
            <div className="px-2 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-3 text-sm text-[#a5adc2] hover:text-[#f7f8ff] transition-colors cursor-pointer">
              <Clock className="w-4 h-4" />
              Recent
            </div>
            <div className="px-2 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-3 text-sm text-[#a5adc2] hover:text-[#f7f8ff] transition-colors cursor-pointer">
              <Activity className="w-4 h-4" />
              Usage
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-white/5 pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#22d3ee] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user.username?.[0]?.toUpperCase() ?? "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f7f8ff] truncate">{user.username}</p>
                <p className="text-xs text-[#677086] truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-1 px-2 py-1.5 rounded-lg hover:bg-red-500/10 flex items-center gap-3 text-sm text-[#677086] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#f7f8ff]">
                Welcome back, {user.username?.split("_")[0] ?? "there"} 👋
              </h1>
              <p className="text-sm text-[#677086] mt-1">
                Manage your AI-generated diagrams and projects.
              </p>
            </div>
            <Link href="/editor">
              <Button className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white gap-2 rounded-lg px-5">
                <Plus className="w-4 h-4" />
                New Diagram
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Total Diagrams",
                value: profile?.diagramCount ?? diagrams.length,
                icon: <FileText className="w-5 h-5 text-[#7c5cff]" />,
                color: "border-[#7c5cff]/20 bg-[#7c5cff]/5",
              },
              {
                label: "AI Generations",
                value: profile?.generationCount ?? 0,
                icon: <Cpu className="w-5 h-5 text-[#22d3ee]" />,
                color: "border-[#22d3ee]/20 bg-[#22d3ee]/5",
              },
              {
                label: "Recent Activity",
                value: diagrams.length > 0 ? formatRelativeTime(diagrams[0]?.updatedAt ?? "") : "—",
                icon: <Clock className="w-5 h-5 text-[#22c55e]" />,
                color: "border-[#22c55e]/20 bg-[#22c55e]/5",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`border rounded-xl p-5 ${stat.color}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#677086] font-semibold uppercase tracking-wider">
                    {stat.label}
                  </span>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-[#f7f8ff]">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Diagrams Section */}
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-lg font-bold text-[#f7f8ff]">Your Diagrams</h2>
            <div className="flex-1 relative max-w-xs ml-auto">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#677086]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search diagrams..."
                className="pl-9 bg-[#0d1018] border-white/5 focus:border-[#7c5cff] text-sm text-[#f7f8ff] h-9"
              />
            </div>
          </div>

          {/* Empty State */}
          {!loading && filteredDiagrams.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-white/5 rounded-xl bg-[#0d1018]/30 p-16 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#7c5cff]/10 border border-[#7c5cff]/20 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-[#7c5cff]" />
              </div>
              <h3 className="text-xl font-bold text-[#f7f8ff] mb-2">
                {search ? "No diagrams found" : "Create your first diagram"}
              </h3>
              <p className="text-sm text-[#677086] max-w-xs mx-auto mb-6">
                {search
                  ? "Try a different search term."
                  : "Use AI to generate a diagram from a description, or start from scratch."}
              </p>
              {!search && (
                <Link href="/editor">
                  <Button className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Start Creating
                  </Button>
                </Link>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-white/5 rounded-xl bg-[#0d1018]/30 p-5 h-40 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Diagram Cards */}
          {!loading && filteredDiagrams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredDiagrams.map((diagram, i) => {
                  const colorClass =
                    DIAGRAM_COLORS[diagram.diagramType] ?? DIAGRAM_COLORS.default
                  const icon = DIAGRAM_ICONS[diagram.diagramType] ?? DIAGRAM_ICONS.default

                  return (
                    <motion.div
                      key={diagram.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group border rounded-xl bg-gradient-to-br p-5 ${colorClass} hover:border-opacity-40 transition-all cursor-pointer`}
                      onClick={() => handleOpenDiagram(diagram)}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[#0d1018]/50 border border-white/5 flex items-center justify-center">
                          {icon}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDiagram(diagram)
                            }}
                            className="p-1.5 rounded hover:bg-white/10 text-[#677086] hover:text-[#f7f8ff] transition-colors"
                            title="Open in editor"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirm(diagram.id)
                            }}
                            className="p-1.5 rounded hover:bg-red-500/10 text-[#677086] hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-[#f7f8ff] mb-1 truncate">
                        {diagram.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-[#677086]">
                        <span className="capitalize bg-white/5 px-2 py-0.5 rounded">
                          {diagram.diagramType}
                        </span>
                        <span>{diagram.nodeCount} nodes</span>
                        <span>{diagram.edgeCount} edges</span>
                      </div>

                      {/* Timestamp + Open */}
                      <div className="flex items-center justify-between mt-4 text-xs text-[#677086]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(diagram.updatedAt)}
                        </span>
                        <span className="flex items-center gap-1 text-[#7c5cff] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          Open <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d1018] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-[#f7f8ff] text-center mb-1">Delete Diagram?</h3>
              <p className="text-sm text-[#677086] text-center mb-6">
                This action cannot be undone. The diagram will be permanently removed from your account.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 text-[#a5adc2] hover:bg-white/5"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-500/90 text-white"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
