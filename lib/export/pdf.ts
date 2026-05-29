import jsPDF from "jspdf"

interface CanvasStage {
  toCanvas: (options?: { pixelRatio?: number }) => HTMLCanvasElement
  getStage?: () => CanvasStage | null
}

export async function exportToPDF(
  stageRef: CanvasStage | { getStage: () => CanvasStage | null } | null,
  filename = `diagram-${Date.now()}.pdf`,
): Promise<void> {
  const stage = resolveStage(stageRef)

  if (!stage) {
    throw new Error("Stage reference not available")
  }

  try {
    const canvas = stage.toCanvas({ pixelRatio: 2 })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save(filename)
  } catch (error) {
    console.error("PDF export failed:", error)
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
