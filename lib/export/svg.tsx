interface CanvasStage {
  width: () => number
  height: () => number
  toCanvas: (options?: { pixelRatio?: number }) => HTMLCanvasElement
  getStage?: () => CanvasStage | null
}

export async function exportToSVG(stageRef: CanvasStage | { getStage: () => CanvasStage | null } | null): Promise<string> {
  const stage = resolveStage(stageRef)

  if (!stage) {
    throw new Error("Stage reference not available")
  }

  try {
    const canvas = stage.toCanvas({ pixelRatio: 2 })

    const svgContent = `
      <svg width="${stage.width()}" height="${stage.height()}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>
        <image width="${stage.width()}" height="${stage.height()}" 
               xlink:href="${canvas.toDataURL()}" />
      </svg>
    `

    return svgContent
  } catch (error) {
    console.error("SVG export failed:", error)
    throw error
  }
}

function resolveStage(stageRef: CanvasStage | { getStage: () => CanvasStage | null } | null): CanvasStage | null {
  if (!stageRef) return null
  if ("getStage" in stageRef && typeof stageRef.getStage === "function") return stageRef.getStage()
  return isCanvasStage(stageRef) ? stageRef : null
}

function isCanvasStage(value: unknown): value is CanvasStage {
  return (
    typeof value === "object" &&
    value !== null &&
    "toCanvas" in value &&
    typeof value.toCanvas === "function"
  )
}
