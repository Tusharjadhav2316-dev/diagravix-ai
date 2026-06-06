"use client"
/**
 * Firebase Auth Store (Zustand)
 * Replaces the previous mock Zustand auth with real Firebase Auth.
 * Handles Google login, email/password login, register, logout.
 * Persists the lightweight session info to localStorage for instant hydration.
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  firebaseSignOut,
  subscribeToAuth,
  getUserProfile,
  type FirebaseUserProfile,
} from "@/services/firebase-auth"
import type { User } from "firebase/auth"

export interface UserSession {
  uid: string
  username: string
  email: string
  photoURL: string | null
  createdAt: string
}

interface AuthState {
  user: UserSession | null
  firebaseUser: User | null
  profile: FirebaseUserProfile | null
  loading: boolean
  error: string | null
  hydrated: boolean

  // Actions
  loginWithGoogle: () => Promise<boolean>
  loginWithEmail: (email: string, password: string) => Promise<boolean>
  registerWithEmail: (name: string, email: string, password: string) => Promise<boolean>
  logoutUser: () => Promise<void>
  setFirebaseUser: (user: User | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      profile: null,
      loading: false,
      error: null,
      hydrated: false,

      setFirebaseUser: async (firebaseUser) => {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid)
          set({
            firebaseUser,
            user: {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
              email: firebaseUser.email ?? "",
              photoURL: firebaseUser.photoURL ?? null,
              createdAt: profile?.createdAt ?? new Date().toISOString(),
            },
            profile,
            hydrated: true,
          })
        } else {
          set({ firebaseUser: null, user: null, profile: null, hydrated: true })
        }
      },

      loginWithGoogle: async () => {
        set({ loading: true, error: null })
        try {
          const fbUser = await signInWithGoogle()
          const profile = await getUserProfile(fbUser.uid)
          set({
            firebaseUser: fbUser,
            user: {
              uid: fbUser.uid,
              username: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
              email: fbUser.email ?? "",
              photoURL: fbUser.photoURL ?? null,
              createdAt: profile?.createdAt ?? new Date().toISOString(),
            },
            profile,
            loading: false,
          })
          return true
        } catch (err: any) {
          set({ error: err.message ?? "Google sign-in failed.", loading: false })
          return false
        }
      },

      loginWithEmail: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const fbUser = await signInWithEmail(email, password)
          const profile = await getUserProfile(fbUser.uid)
          set({
            firebaseUser: fbUser,
            user: {
              uid: fbUser.uid,
              username: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
              email: fbUser.email ?? "",
              photoURL: fbUser.photoURL ?? null,
              createdAt: profile?.createdAt ?? new Date().toISOString(),
            },
            profile,
            loading: false,
          })
          return true
        } catch (err: any) {
          const msg =
            err.code === "auth/invalid-credential" ||
            err.code === "auth/wrong-password" ||
            err.code === "auth/user-not-found"
              ? "Invalid email or password."
              : err.message ?? "Login failed."
          set({ error: msg, loading: false })
          return false
        }
      },

      registerWithEmail: async (name, email, password) => {
        set({ loading: true, error: null })
        try {
          const fbUser = await registerWithEmail(name, email, password)
          const profile = await getUserProfile(fbUser.uid)
          set({
            firebaseUser: fbUser,
            user: {
              uid: fbUser.uid,
              username: name,
              email: fbUser.email ?? "",
              photoURL: null,
              createdAt: new Date().toISOString(),
            },
            profile,
            loading: false,
          })
          return true
        } catch (err: any) {
          const msg =
            err.code === "auth/email-already-in-use"
              ? "This email is already registered."
              : err.code === "auth/weak-password"
              ? "Password must be at least 6 characters."
              : err.message ?? "Registration failed."
          set({ error: msg, loading: false })
          return false
        }
      },

      logoutUser: async () => {
        await firebaseSignOut()
        set({ user: null, firebaseUser: null, profile: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "diagravix-firebase-auth",
      // Only persist lightweight session data (no full firebase User object)
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)
