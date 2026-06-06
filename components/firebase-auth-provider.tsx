"use client"

import { useEffect } from "react"
import { subscribeToAuth } from "@/services/firebase-auth"
import { useAuthStore } from "@/stores/auth-store"

/**
 * FirebaseAuthProvider
 * Subscribes to Firebase auth state on mount.
 * Syncs auth state to Zustand store globally.
 * Mount this once at the root layout.
 */
export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser)

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setFirebaseUser(user)
    })
    return () => unsubscribe()
  }, [setFirebaseUser])

  return <>{children}</>
}
