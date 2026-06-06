/**
 * Firestore Diagram Service
 * Save, load, delete, list diagrams for a user.
 * All operations are scoped to the authenticated user (secure).
 */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore"
import { db } from "@/firebase/client"
import type { Diagram } from "@/types/diagram"

// --------------- Types ---------------

export interface SavedDiagram {
  id: string
  uid: string
  title: string
  description: string
  diagramType: string
  nodeCount: number
  edgeCount: number
  thumbnail: string | null
  createdAt: string
  updatedAt: string
  data: Diagram
}

export interface DiagramListItem {
  id: string
  title: string
  description: string
  diagramType: string
  nodeCount: number
  edgeCount: number
  thumbnail: string | null
  createdAt: string
  updatedAt: string
}

// --------------- Helpers ---------------

function diagramToListItem(id: string, data: Record<string, any>): DiagramListItem {
  return {
    id,
    title: data.title ?? "Untitled Diagram",
    description: data.description ?? "",
    diagramType: data.diagramType ?? "flowchart",
    nodeCount: data.nodeCount ?? 0,
    edgeCount: data.edgeCount ?? 0,
    thumbnail: data.thumbnail ?? null,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? new Date().toISOString(),
  }
}

// --------------- CRUD Operations ---------------

/** Save a new diagram to Firestore */
export async function saveDiagram(
  uid: string,
  diagram: Diagram,
  title?: string
): Promise<string> {
  const diagramsRef = collection(db, "diagrams")

  const payload = {
    uid,
    title: title ?? diagram.title ?? "Untitled Diagram",
    description: diagram.description ?? "",
    diagramType: diagram.diagramType ?? "flowchart",
    nodeCount: diagram.nodes?.length ?? 0,
    edgeCount: diagram.edges?.length ?? 0,
    thumbnail: null,
    data: diagram,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(diagramsRef, payload)

  // Increment the user's diagram count
  await updateDoc(doc(db, "users", uid), {
    diagramCount: increment(1),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

/** Update an existing saved diagram */
export async function updateDiagram(
  diagramId: string,
  uid: string,
  diagram: Diagram,
  title?: string
): Promise<void> {
  const ref = doc(db, "diagrams", diagramId)
  const snap = await getDoc(ref)

  if (!snap.exists() || snap.data().uid !== uid) {
    throw new Error("Diagram not found or access denied")
  }

  await updateDoc(ref, {
    title: title ?? diagram.title ?? "Untitled Diagram",
    description: diagram.description ?? "",
    diagramType: diagram.diagramType ?? "flowchart",
    nodeCount: diagram.nodes?.length ?? 0,
    edgeCount: diagram.edges?.length ?? 0,
    data: diagram,
    updatedAt: serverTimestamp(),
  })
}

/** Save or update - upsert by ID */
export async function upsertDiagram(
  uid: string,
  diagram: Diagram,
  diagramId?: string | null,
  title?: string
): Promise<string> {
  if (diagramId) {
    try {
      await updateDiagram(diagramId, uid, diagram, title)
      return diagramId
    } catch {
      // Fall through to create new if update fails
    }
  }
  return saveDiagram(uid, diagram, title)
}

/** Load a single diagram by ID */
export async function loadDiagram(diagramId: string, uid: string): Promise<SavedDiagram | null> {
  const snap = await getDoc(doc(db, "diagrams", diagramId))

  if (!snap.exists()) return null

  const data = snap.data()
  if (data.uid !== uid) throw new Error("Access denied")

  return {
    id: snap.id,
    uid: data.uid,
    title: data.title,
    description: data.description ?? "",
    diagramType: data.diagramType,
    nodeCount: data.nodeCount,
    edgeCount: data.edgeCount,
    thumbnail: data.thumbnail ?? null,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    data: data.data as Diagram,
  }
}

/** List all diagrams for a user (sorted by most recent) */
export async function listUserDiagrams(uid: string, maxItems = 20): Promise<DiagramListItem[]> {
  const q = query(
    collection(db, "diagrams"),
    where("uid", "==", uid),
    orderBy("updatedAt", "desc"),
    limit(maxItems)
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => diagramToListItem(d.id, d.data()))
}

/** Delete a diagram */
export async function deleteDiagram(diagramId: string, uid: string): Promise<void> {
  const ref = doc(db, "diagrams", diagramId)
  const snap = await getDoc(ref)

  if (!snap.exists() || snap.data().uid !== uid) {
    throw new Error("Diagram not found or access denied")
  }

  await deleteDoc(ref)

  // Decrement the user's diagram count
  await updateDoc(doc(db, "users", uid), {
    diagramCount: increment(-1),
    updatedAt: serverTimestamp(),
  })
}

/** Log an AI generation event for the user */
export async function logGeneration(uid: string, prompt: string, success: boolean): Promise<void> {
  await addDoc(collection(db, "generations"), {
    uid,
    prompt: prompt.slice(0, 500),
    success,
    createdAt: serverTimestamp(),
  })

  await updateDoc(doc(db, "users", uid), {
    generationCount: increment(1),
    updatedAt: serverTimestamp(),
  })
}
