"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface DiagramToolbarProps {
  onAddShape: (type: string) => void
  onClear: () => void
}

export default function DiagramToolbar({ onAddShape, onClear }: DiagramToolbarProps) {
  return (
    <Card className="w-20 border-r border-l-0 border-t-0 border-b-0 rounded-none flex flex-col p-3 space-y-2 bg-card">
      <Button size="icon" variant="outline" onClick={() => onAddShape("box")} title="Add box">
        <Plus className="w-5 h-5" />
      </Button>

      <Button size="icon" variant="outline" onClick={() => onAddShape("circle")} title="Add circle">
        <Plus className="w-5 h-5" />
      </Button>

      <Button size="icon" variant="outline" onClick={onClear} title="Clear canvas" className="mt-auto bg-transparent">
        <Trash2 className="w-5 h-5" />
      </Button>
    </Card>
  )
}
