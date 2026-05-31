"use client"

import { useState, useEffect } from "react"
import Script from "next/script"
import DiagramEditor from "@/components/diagram-editor"
import { Button } from "@/components/ui/button"

export default function EditorPage() {
  const [mode, setMode] = useState<"draw" | "generate">("generate")

  // Dynamic CDN Scripts states
  const [threeLoaded, setThreeLoaded] = useState(false)
  const [vantaLoaded, setVantaLoaded] = useState(false)

  // Initialize Vanta.js Clouds2 Effect
  useEffect(() => {
    let vantaEffect: any = null

    if (vantaLoaded && typeof window !== "undefined" && (window as any).VANTA && (window as any).VANTA.CLOUDS2) {
      try {
        vantaEffect = (window as any).VANTA.CLOUDS2({
          el: "#vanta-canvas-bg",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          backgroundColor: 0x0,
          skyColor: 0x5ca6ca,
          cloudColor: 0x334d80,
          lightColor: 0xffffff,
          speed: 0.60, // Slower motion inside editor for focus
          texturePath: "https://raw.githubusercontent.com/tengbao/vanta/master/gallery/noise.png"
        })
      } catch (err) {
        console.warn("[Vanta] Failed to initialize inside editor:", err)
      }
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaLoaded])

  return (
    <main className="min-h-screen bg-[#07080d] text-[#f7f8ff] relative overflow-hidden font-sans antialiased">
      {/* Vanta Canvas Background */}
      <div id="vanta-canvas-bg" className="fixed inset-0 z-0 pointer-events-none opacity-20" />
      
      {/* Dark overlay to ensure focus and contrast inside editor */}
      <div className="fixed inset-0 bg-[#07080d]/80 z-0 pointer-events-none" />

      {/* CDN Scripts */}
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
        <div className="border-b border-white/5 bg-[#0d1018]/50 backdrop-blur-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-[#f7f8ff]">Diagram Editor</h1>
              <p className="text-xs text-[#a5adc2] mt-0.5">
                Generate diagrams from text or draw manually. Export to PNG, SVG, PDF, Mermaid, or PlantUML
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant={mode === "generate" ? "default" : "outline"} onClick={() => setMode("generate")} className="text-xs px-3 h-8">
                AI Generate
              </Button>
              <Button variant={mode === "draw" ? "default" : "outline"} onClick={() => setMode("draw")} className="text-xs px-3 h-8">
                Manual Draw
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <DiagramEditor mode={mode} />
        </div>
      </div>
    </main>
  )
}
