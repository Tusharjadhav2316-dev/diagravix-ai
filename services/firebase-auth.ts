/**
 * Firebase Auth Service
 * Wraps Firebase Auth operations: sign-in with Google, email/password, logout
 */
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider } from "@/firebase/client"

// --------------- User Profile ---------------

export interface FirebaseUserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  createdAt: string
  updatedAt: string
  diagramCount: number
  generationCount: number
}

/** Ensure a Firestore user doc exists (create if first login) */
async function ensureUserDoc(user: User): Promise<FirebaseUserProfile> {
  const ref = doc(db, "users", user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const profile: FirebaseUserProfile = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? user.email?.split("@")[0] ?? "User",
      photoURL: user.photoURL ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      diagramCount: 0,
      generationCount: 0,
    }
    await setDoc(ref, { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    return profile
  }

  return snap.data() as FirebaseUserProfile
}

// --------------- Auth Methods ---------------

/** Google Sign-In via popup */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await ensureUserDoc(result.user)
  return result.user
}

/** Email + Password Sign-In */
export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

/** Email + Password Registration */
export async function registerWithEmail(
  displayName: string,
  email: string,
  password: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  // Set display name on the auth profile
  await updateProfile(result.user, { displayName })
  await ensureUserDoc(result.user)
  return result.user
}

/** Sign Out */
export async function firebaseSignOut() {
  await signOut(auth)
}

/** Subscribe to auth state changes */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

/** Get current user's Firestore profile */
export async function getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? (snap.data() as FirebaseUserProfile) : null
}
