"use client"

import { useEffect } from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Save,
  Undo2,
  Redo2,
  Trash2,
  PlusCircle,
  FileImage,
  FileCode,
  FileJson,
  FileText,
  Share2,
  HelpCircle,
  Tv,
  Globe,
  Compass,
} from "lucide-react"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: string) => void
}

export default function CommandMenu({ open, onOpenChange, onAction }: CommandMenuProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = (action: string) => {
    onAction(action)
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="bg-[#0d1018]/95 border-white/10 text-[#f7f8ff] backdrop-blur-xl shadow-2xl rounded-2xl"
    >
      <CommandInput
        placeholder="Type a command or search..."
        className="border-white/5 text-[#f7f8ff] placeholder:text-[#677086] focus:ring-0 text-sm py-5 h-12 bg-transparent"
      />
      <CommandList className="max-h-[340px] text-xs text-[#a5adc2] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <CommandEmpty className="py-6 text-[#677086] text-center">No results found.</CommandEmpty>
        
        {/* Core Actions */}
        <CommandGroup heading="Canvas Actions" className="px-2 pt-2 text-[#677086]">
          <CommandItem
            onSelect={() => runCommand("save")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#7c5cff]" />
            <span>Save Diagram</span>
            <CommandShortcut className="text-[#677086] font-mono text-[10px]">Ctrl + S</CommandShortcut>
          </CommandItem>
          
          <CommandItem
            onSelect={() => runCommand("undo")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <Undo2 className="w-4 h-4 text-[#22d3ee]" />
            <span>Undo</span>
            <CommandShortcut className="text-[#677086] font-mono text-[10px]">Ctrl + Z</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("redo")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <Redo2 className="w-4 h-4 text-[#22d3ee]" />
            <span>Redo</span>
            <CommandShortcut className="text-[#677086] font-mono text-[10px]">Ctrl + Y</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("add-node")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#22c55e]" />
            <span>Add Node</span>
            <CommandShortcut className="text-[#677086] font-mono text-[10px]">Click Canvas</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("clear")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Clear Canvas</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-white/5" />

        {/* Sharing & Visiblity */}
        <CommandGroup heading="Sharing & Visibility" className="px-2 pt-2 text-[#677086]">
          <CommandItem
            onSelect={() => runCommand("toggle-visibility")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#7c5cff]" />
            <span>Toggle Public/Private</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("copy-link")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#7c5cff]" />
            <span>Copy Share Link</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-white/5" />

        {/* Export Options */}
        <CommandGroup heading="Export Diagram" className="px-2 pt-2 text-[#677086]">
          <CommandItem
            onSelect={() => runCommand("export-png")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <FileImage className="w-4 h-4 text-[#e0a82e]" />
            <span>Export PNG (Standard 2x)</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("export-png-hq")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <FileImage className="w-4 h-4 text-[#e0a82e]" />
            <span>Export PNG (Print 3x)</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("export-svg")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <FileImage className="w-4 h-4 text-[#e0a82e]" />
            <span>Export SVG</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("export-pdf")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#ef4444]" />
            <span>Export PDF</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("export-json")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-[#3b82f6]" />
            <span>Export JSON Data</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("export-mermaid")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-[#10b981]" />
            <span>Export Mermaid (.mmd)</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("export-plantuml")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-[#10b981]" />
            <span>Export PlantUML (.puml)</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-white/5" />

        {/* Support & Tour */}
        <CommandGroup heading="Help & Support" className="px-2 pb-2 text-[#677086]">
          <CommandItem
            onSelect={() => runCommand("open-shortcuts")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#a5adc2]" />
            <span>Keyboard Shortcuts Help</span>
            <CommandShortcut className="text-[#677086] font-mono text-[10px]">Ctrl + H</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand("reset-tour")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[#a5adc2] hover:text-[#f7f8ff] transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#7c5cff]" />
            <span>Restart Product Tour</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
