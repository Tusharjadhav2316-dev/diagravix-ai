interface ExportableStage {
  toDataURL?: (options?: { pixelRatio?: number }) => string
  exportPNG?: (options?: { pixelRatio?: number }) => string | null
}

export async function exportToPNG(stage: ExportableStage | null): Promise<string> {
  if (!stage) {
    throw new Error("Stage reference not available")
  }

  try {
    const uri = stage.exportPNG?.({ pixelRatio: 2 }) ?? stage.toDataURL?.({ pixelRatio: 2 })
    if (!uri) throw new Error("Stage does not support PNG export")
    return uri
  } catch (error) {
    console.error("PNG export failed:", error)
    throw error
  }
}
