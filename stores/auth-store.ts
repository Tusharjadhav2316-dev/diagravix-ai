import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface UserSession {
  username: string
  email: string
  createdAt: string
}

interface RegisterUser {
  username: string
  email: string
  passwordHash: string
}

interface AuthState {
  user: UserSession | null
  users: RegisterUser[]
  activeOtpCode: string | null
  activeOtpUser: string | null
  loading: boolean
  error: string | null
  
  registerUser: (username: string, email: string, password: string) => Promise<boolean>
  loginUser: (usernameOrEmail: string, password: string) => Promise<boolean>
  logoutUser: () => void
  sendOtp: (username: string) => Promise<boolean>
  verifyOtpAndResetPassword: (username: string, otp: string, newPassword: string) => Promise<boolean>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      // Seed with a default demo user so it works instantly out of the box
      users: [
        {
          username: "demo_user",
          email: "demo@diagravix.ai",
          passwordHash: "password123", // Simplified mock hashing
        },
      ],
      activeOtpCode: null,
      activeOtpUser: null,
      loading: false,
      error: null,

      registerUser: async (username, email, password) => {
        set({ loading: true, error: null })
        
        // Wait to simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))
        
        const { users } = get()
        const userExists = users.some(
          (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
        )

        if (userExists) {
          set({ error: "Username or Email already registered.", loading: false })
          return false
        }

        const newUser: RegisterUser = {
          username,
          email,
          passwordHash: password, // In production, hash this password
        }

        set({
          users: [...users, newUser],
          user: {
            username,
            email,
            createdAt: new Date().toISOString(),
          },
          loading: false,
        })
        return true
      },

      loginUser: async (usernameOrEmail, password) => {
        set({ loading: true, error: null })
        
        await new Promise((resolve) => setTimeout(resolve, 800))
        
        const { users } = get()
        const found = users.find(
          (u) =>
            (u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
              u.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
            u.passwordHash === password
        )

        if (!found) {
          set({ error: "Invalid credentials.", loading: false })
          return false
        }

        set({
          user: {
            username: found.username,
            email: found.email,
            createdAt: new Date().toISOString(),
          },
          loading: false,
        })
        return true
      },

      logoutUser: () => {
        set({ user: null })
      },

      sendOtp: async (username) => {
        set({ loading: true, error: null })
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        const { users } = get()
        const found = users.some((u) => u.username.toLowerCase() === username.toLowerCase())
        
        if (!found) {
          set({ error: "Username not found.", loading: false })
          return false
        }

        // Mock OTP code generated
        const otpCode = "123456" 
        set({
          activeOtpCode: otpCode,
          activeOtpUser: username,
          loading: false,
        })
        console.log(`[MOCK OTP] Sent OTP code "${otpCode}" to user "${username}"`)
        return true
      },

      verifyOtpAndResetPassword: async (username, otp, newPassword) => {
        set({ loading: true, error: null })
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        const { activeOtpCode, activeOtpUser, users } = get()
        if (activeOtpUser?.toLowerCase() !== username.toLowerCase() || activeOtpCode !== otp) {
          set({ error: "Invalid OTP code verification.", loading: false })
          return false
        }

        // Update password hash in users array
        const updatedUsers = users.map((u) =>
          u.username.toLowerCase() === username.toLowerCase()
            ? { ...u, passwordHash: newPassword }
            : u
        )

        set({
          users: updatedUsers,
          activeOtpCode: null,
          activeOtpUser: null,
          loading: false,
        })
        return true
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "diagravix-auth",
      partialize: (state) => ({ users: state.users, user: state.user }), // Save only persistent data
    }
  )
)
