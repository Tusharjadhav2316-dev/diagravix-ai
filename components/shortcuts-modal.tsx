"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

interface ShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  const shortcutGroups = [
    {
      title: "General",
      shortcuts: [
        { keys: ["Ctrl", "K"], label: "Open Command Menu" },
        { keys: ["Ctrl", "S"], label: "Save Diagram" },
        { keys: ["Ctrl", "H"], label: "View Keyboard Shortcuts" },
        { keys: ["Esc"], label: "Clear selection / Cancel" },
      ],
    },
    {
      title: "History & Edit",
      shortcuts: [
        { keys: ["Ctrl", "Z"], label: "Undo action" },
        { keys: ["Ctrl", "Y"], label: "Redo action" },
        { keys: ["Delete"], label: "Delete selected elements" },
        { keys: ["Backspace"], label: "Delete selected elements" },
      ],
    },
    {
      title: "Canvas Controls",
      shortcuts: [
        { keys: ["Ctrl", "+"], label: "Zoom In" },
        { keys: ["Ctrl", "-"], label: "Zoom Out" },
        { keys: ["Ctrl", "0"], label: "Fit Canvas View" },
        { keys: ["Space", "Drag"], label: "Pan Canvas" },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[#0d1018]/90 border-white/10 text-[#f7f8ff] backdrop-blur-xl rounded-2xl shadow-2xl p-6">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-[#7c5cff]/10 border border-[#7c5cff]/20 flex items-center justify-center text-[#7c5cff]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold">Keyboard Shortcuts</DialogTitle>
            <DialogDescription className="text-xs text-[#677086]">
              Navigate Diagravix AI like a professional.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-5 space-y-6">
          {shortcutGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <h4 className="text-[10px] font-semibold text-[#677086] uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="grid gap-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 hover:bg-white/2 rounded transition-colors px-1"
                  >
                    <span className="text-[#a5adc2] font-medium">{shortcut.label}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="bg-[#07080d] border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-[#f7f8ff] shadow-inner font-bold"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
