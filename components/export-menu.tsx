"use client"

import type React from "react"

import { useState } from "react"
import { Download, FileJson, ImageIcon, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GeneratedDiagram } from "@/lib/diagram-generator"
import { exportToPNG, exportToSVG, exportToPDF, exportToMermaid, exportToPlantUML, exportToJSON } from "@/lib/export"

interface StageExportHandle {
  getStage?: () => {
    width: () => number
    height: () => number
    toCanvas: (options?: { pixelRatio?: number }) => HTMLCanvasElement
    toDataURL?: (options?: { pixelRatio?: number }) => string
  } | null
  toDataURL?: (options?: { pixelRatio?: number }) => string
  exportPNG?: (options?: { pixelRatio?: number }) => string | null
}

interface ExportMenuProps {
  diagram: GeneratedDiagram
  stageRef: React.RefObject<StageExportHandle | null>
}

export default function ExportMenu({ diagram, stageRef }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: string) => {
    setIsExporting(true)
    try {
      switch (format) {
        case "png":
          await exportToPNG(stageRef.current)
          break
        case "svg":
          await exportToSVG(stageRef.current?.getStage?.() ?? null)
          break
        case "pdf":
          await exportToPDF(stageRef.current?.getStage?.() ?? null)
          break
        case "mermaid":
          await exportToMermaid(diagram)
          break
        case "plantuml":
          await exportToPlantUML(diagram)
          break
        case "json":
          await exportToJSON(diagram)
          break
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-foreground">Image Formats</div>
        <DropdownMenuItem onClick={() => handleExport("png")}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("svg")}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-sm font-semibold text-foreground">Code Formats</div>
        <DropdownMenuItem onClick={() => handleExport("mermaid")}>
          <FileCode className="w-4 h-4 mr-2" />
          Export as Mermaid
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("plantuml")}>
          <FileCode className="w-4 h-4 mr-2" />
          Export as PlantUML
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-sm font-semibold text-foreground">Data Format</div>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
