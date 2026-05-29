export function exportToJSON(diagram: unknown): string {
  const jsonContent = JSON.stringify(diagram, null, 2)

  return jsonContent
}
