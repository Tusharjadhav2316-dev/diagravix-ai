// NLP Entity Extraction Module
// Extracts entities and relationships from text descriptions

export interface Entity {
  id: string
  text: string
  type: "noun" | "verb" | "adjective" | "action"
  startIndex: number
  endIndex: number
}

export interface Relationship {
  source: Entity
  target: Entity
  type: string
  verb: string
}

export interface ParsedDiagram {
  entities: Entity[]
  relationships: Relationship[]
  rawText: string
}

// Simple NLP tokenizer
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,;:.!?()]+/)
    .filter((token) => token.length > 0)
}

// Basic POS tagging using simple heuristics
function posTag(tokens: string[]): Array<[string, string]> {
  const articles = new Set(["a", "an", "the"])
  const verbs = new Set([
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "connects",
    "connects to",
    "linked to",
    "points to",
    "sends",
    "receives",
    "flows to",
    "goes to",
    "contains",
    "includes",
    "has",
  ])
  const prepositions = new Set(["to", "from", "in", "on", "at", "by", "with"])

  return tokens.map((token) => {
    if (articles.has(token)) return [token, "DT"]
    if (verbs.has(token)) return [token, "VB"]
    if (prepositions.has(token)) return [token, "IN"]
    if (/^\d+$/.test(token)) return [token, "CD"]
    return [token, "NN"] // Default to noun
  })
}

// Extract noun phrases (potential entities)
function extractNounPhrases(taggedTokens: Array<[string, string]>): Entity[] {
  const entities: Entity[] = []
  let currentPhrase: Array<[string, string]> = []
  let startIndex = 0

  taggedTokens.forEach((token, index) => {
    if (token[1] === "NN" || token[1] === "DT" || token[1] === "JJ") {
      if (currentPhrase.length === 0) startIndex = index
      currentPhrase.push(token)
    } else {
      if (currentPhrase.length > 0) {
        const entityText = currentPhrase.map((t) => t[0]).join(" ")
        if (entityText.length > 1 && !entityText.match(/^(a|an|the)$/)) {
          entities.push({
            id: `entity-${entities.length}`,
            text: entityText,
            type: "noun",
            startIndex,
            endIndex: index - 1,
          })
        }
        currentPhrase = []
      }
    }
  })

  // Handle last phrase
  if (currentPhrase.length > 0) {
    const entityText = currentPhrase.map((t) => t[0]).join(" ")
    if (entityText.length > 1 && !entityText.match(/^(a|an|the)$/)) {
      entities.push({
        id: `entity-${entities.length}`,
        text: entityText,
        type: "noun",
        startIndex,
        endIndex: taggedTokens.length - 1,
      })
    }
  }

  return entities
}

// Extract relationships between entities
function extractRelationships(text: string, entities: Entity[], taggedTokens: Array<[string, string]>): Relationship[] {
  const relationships: Relationship[] = []

  // Look for patterns like "entity1 verb entity2"
  const verbPatterns = [
    "connects to",
    "connected to",
    "links to",
    "linked to",
    "points to",
    "sends to",
    "receives from",
    "flows to",
    "goes to",
    "contains",
    "includes",
  ]

  for (let i = 0; i < taggedTokens.length - 2; i++) {
    const currentToken = taggedTokens[i][0]
    const nextToken = taggedTokens[i + 1]?.[0]
    const thirdToken = taggedTokens[i + 2]?.[0]

    const potentialVerb = [currentToken, nextToken, thirdToken].join(" ")

    if (verbPatterns.some((pattern) => potentialVerb.includes(pattern))) {
      // Find entities before and after verb
      const beforeEntities = entities.filter((e) => e.endIndex < i)
      const afterEntities = entities.filter((e) => e.startIndex > i + 2)

      if (beforeEntities.length > 0 && afterEntities.length > 0) {
        const source = beforeEntities[beforeEntities.length - 1]
        const target = afterEntities[0]

        relationships.push({
          source,
          target,
          type: "connection",
          verb: potentialVerb.trim(),
        })
      }
    }
  }

  return relationships
}

// Main extraction function
export function extractDiagramElements(text: string): ParsedDiagram {
  const tokens = tokenize(text)
  const taggedTokens = posTag(tokens)
  const entities = extractNounPhrases(taggedTokens)
  const relationships = extractRelationships(text, entities, taggedTokens)

  return {
    entities: entities.filter((e, i, arr) => arr.indexOf(e) === i), // Remove duplicates
    relationships,
    rawText: text,
  }
}

// Validate and clean entities
export function cleanEntities(entities: Entity[]): Entity[] {
  const stopwords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "from",
    "for",
    "with",
    "by",
    "about",
    "as",
  ])

  return entities
    .filter((e) => !stopwords.has(e.text.toLowerCase()))
    .filter((e) => e.text.length > 2)
    .map((e, i) => ({ ...e, id: `entity-${i}` }))
}

// Group related entities
export function groupRelatedEntities(entities: Entity[]): Map<string, Entity[]> {
  const groups = new Map<string, Entity[]>()

  entities.forEach((entity) => {
    const category = entity.type
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(entity)
  })

  return groups
}
