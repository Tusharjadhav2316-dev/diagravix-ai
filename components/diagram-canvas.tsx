"use client"

import { useEffect, useRef } from "react"
import Konva from "konva"

interface Shape {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  text: string
}

interface DiagramCanvasProps {
  shapes: Shape[]
  selectedShape: string | null
  onSelectShape: (id: string | null) => void
  onUpdateShape: (id: string, updates: Partial<Shape>) => void
  onDeleteShape: (id: string) => void
}

export default function DiagramCanvas({
  shapes,
  selectedShape,
  onSelectShape,
  onUpdateShape,
  onDeleteShape,
}: DiagramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const layerRef = useRef<Konva.Layer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize stage
    const stage = new Konva.Stage({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      draggable: true,
    })

    const layer = new Konva.Layer()
    stage.add(layer)

    stageRef.current = stage
    layerRef.current = layer

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        stage.width(containerRef.current.clientWidth)
        stage.height(containerRef.current.clientHeight)
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      stage.destroy()
    }
  }, [])

  useEffect(() => {
    if (!layerRef.current) return

    layerRef.current.destroyChildren()

    shapes.forEach((shape) => {
      const isSelected = shape.id === selectedShape

      // Create shape group
      const group = new Konva.Group({
        x: shape.x,
        y: shape.y,
        draggable: true,
        id: shape.id,
      })

      // Create rectangle
      const rect = new Konva.Rect({
        x: 0,
        y: 0,
        width: shape.width,
        height: shape.height,
        fill: isSelected ? "#3b82f6" : "#60a5fa",
        stroke: isSelected ? "#1e40af" : "#3b82f6",
        strokeWidth: isSelected ? 3 : 2,
        cornerRadius: 8,
      })

      // Create text
      const text = new Konva.Text({
        x: 0,
        y: 0,
        width: shape.width,
        height: shape.height,
        text: shape.text,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#ffffff",
        align: "center",
        verticalAlign: "middle",
      })

      group.add(rect, text)

      // Event listeners
      group.on("click", () => {
        onSelectShape(shape.id)
      })

      group.on("dragend", () => {
        onUpdateShape(shape.id, {
          x: group.x(),
          y: group.y(),
        })
      })

      // Delete on double click
      group.on("dblclick", () => {
        onDeleteShape(shape.id)
      })

      layerRef.current!.add(group)
    })

    layerRef.current.batchDraw()
  }, [shapes, selectedShape, onSelectShape, onUpdateShape, onDeleteShape])

  return <div ref={containerRef} className="w-full h-full bg-background" />
}
