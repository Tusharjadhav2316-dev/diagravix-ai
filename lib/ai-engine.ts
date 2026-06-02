import { AIDiagramResponseSchema, type AIDiagramResponse } from "@/types/ai-schema"

// Helper function to build structured prompt instructs
export function buildStructuredPrompt(userInput: string, style = "flowchart"): string {
  return `You are a system modeling assistant. Translate the following user description into a strict, validated structural JSON representation for rendering a diagram.

User Description: "${userInput}"
Diagram Style: ${style}

You MUST follow these rules:
1. Return ONLY a valid JSON object matching the JSON schema below. No conversational text, no markdown formatting (do NOT wrap in \`\`\`json).
2. Create clear, short labels for nodes.
3. Classify node type dynamically:
   - "start" or "end": for boundary/terminal flowchart steps.
   - "decision": for checks, conditions, branches, or validations.
   - "database": for persistence, database tables, or storages.
   - "actor": for user personas or clients.
   - "entity": for data models (ER diagrams) or structural concepts.
   - "class": for system classes (class diagrams) or OOP models.
   - "component" or "interface": for external systems, UI panels, or service layers.
   - "process": for normal actions, functions, or execution steps.
4. Establish logical connections (edges) with labels explaining the relation (e.g. "verifies", "saves", "sends", "if yes").
5. Customize generation parameters based on Diagram Style:
   - If style is "entityrelation" (ER diagram): nodes must represent tables, tables/fields should be typed as "entity", relation labels should indicate keys/cardinalities (e.g. "1-to-many").
   - If style is "class": nodes must represent classes/interfaces, typed as "class", edges represent inheritances/dependencies (e.g. "extends", "implements").
   - If style is "flowchart": nodes represent execution stages, edges represent chronological sequences.

JSON Target Schema:
{
  "diagram_type": "flowchart" | "mindmap" | "sequence" | "class" | "entityrelation",
  "nodes": [
    { "id": "unique-id", "label": "Short Name", "type": "process" | "decision" | "start" | "end" | "database" | "actor" | "interface" | "component" | "entity" | "class", "x": 100, "y": 200 }
  ],
  "edges": [
    { "source": "source-node-id", "target": "target-node-id", "label": "action" }
  ]
}`
}

// Groq API Call
async function callGroqAPI(prompt: string, apiKey: string): Promise<AIDiagramResponse> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    })
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "unknown")
    throw new Error(`Groq API returned HTTP ${response.status}: ${errorBody}`)
  }

  const result = await response.json()
  const rawContent = result.choices?.[0]?.message?.content
  if (!rawContent) {
    throw new Error("Empty message content returned from Groq")
  }

  const parsed = JSON.parse(rawContent)
  return AIDiagramResponseSchema.parse(parsed)
}

// Gemini API Call
async function callGeminiAPI(prompt: string, apiKey: string): Promise<AIDiagramResponse> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API returned HTTP ${response.status}`)
  }

  const result = await response.json()
  const rawContent = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawContent) {
    throw new Error("Empty content returned from Gemini")
  }

  const parsed = JSON.parse(rawContent)
  return AIDiagramResponseSchema.parse(parsed)
}

// Orchestrated multi-provider generation engine with retry/fallback
export async function generateDiagramWithFallback(
  userInput: string,
  style = "flowchart"
): Promise<AIDiagramResponse> {
  const prompt = buildStructuredPrompt(userInput, style)

  const errors: string[] = []

  // 1. Try Groq API
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("[AI Engine] Attempting Groq generation...")
      return await callGroqAPI(prompt, process.env.GROQ_API_KEY)
    } catch (err: any) {
      console.error("[AI Engine] Groq generation failed:", err.message)
      errors.push(`Groq error: ${err.message}`)
    }
  } else {
    errors.push("Groq API key not set in environment")
  }

  // 2. Fallback to Gemini API
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "dummy_val_if_needed") {
    try {
      console.log("[AI Engine] Attempting Gemini fallback generation...")
      return await callGeminiAPI(prompt, process.env.GEMINI_API_KEY)
    } catch (err: any) {
      console.error("[AI Engine] Gemini generation failed:", err.message)
      errors.push(`Gemini error: ${err.message}`)
    }
  } else {
    errors.push("Gemini API key not configured or set as default dummy placeholder")
  }

  // 3. NLP fallback to prevent breaking UI (failsafe)
  console.warn("[AI Engine] All AI models failed. Running local NLP fallback engine.")
  try {
    // Import dynamically to keep code load lightweight
    const { extractDiagramElements, cleanEntities, buildDiagramStructure, autoLayoutNodes } = require("./nlp")
    const parsed = extractDiagramElements(userInput)
    const cleanedEntities = cleanEntities(parsed.entities)
    const structure = buildDiagramStructure({
      ...parsed,
      entities: cleanedEntities,
    })
    
    // Auto-layout elements
    const nodesWithLayout = autoLayoutNodes(structure.nodes, structure.edges)

    return {
      diagram_type: style,
      nodes: nodesWithLayout.map((n: any) => ({
        id: n.id,
        label: n.label,
        type: n.type || "process",
        x: n.x,
        y: n.y,
        width: 140,
        height: 50
      })),
      edges: structure.edges.map((e: any) => ({
        source: e.source,
        target: e.target,
        label: e.label || ""
      }))
    }
  } catch (nlpErr: any) {
    throw new Error(`Failed to generate diagram. AI failed and local NLP fallback crashed. Errors: ${errors.join(", ")}; NLP error: ${nlpErr.message}`)
  }
}
