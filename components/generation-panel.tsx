"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface GenerationPanelProps {
  onGenerate: (text: string) => void
  loading: boolean
  error: string | null
  diagramInfo?: {
    extractedEntities: number
    extractedRelationships: number
  }
}

export default function GenerationPanel({ onGenerate, loading, error, diagramInfo }: GenerationPanelProps) {
  const [text, setText] = useState("")

  const handleGenerate = () => {
    if (text.trim()) {
      onGenerate(text)
    }
  }

  return (
    <div className="w-72 border-r border-border bg-card p-4 overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Diagram Description</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your diagram. Example: 'User submits form, data goes to database, system sends confirmation email'"
            className="w-full h-32 p-3 border border-border rounded bg-background text-foreground text-sm resize-none"
            disabled={loading}
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading || !text.trim()} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Diagram"
          )}
        </Button>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
            {error}
          </div>
        )}

        {diagramInfo && (
          <Card className="p-3 space-y-2 bg-background">
            <div className="text-xs">
              <p className="text-muted-foreground">
                Entities: <span className="text-foreground font-semibold">{diagramInfo.extractedEntities}</span>
              </p>
              <p className="text-muted-foreground">
                Relationships:{" "}
                <span className="text-foreground font-semibold">{diagramInfo.extractedRelationships}</span>
              </p>
            </div>
          </Card>
        )}

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Use action verbs like sends, connects, flows to</li>
            <li>Mention entities such as users, systems, databases</li>
            <li>Describe the sequence of steps</li>
            <li>Be specific about data flow</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
