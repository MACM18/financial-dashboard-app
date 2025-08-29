import { neon } from "@neondatabase/serverless"
import { randomBytes, createHash } from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  email: string
  displayName: string | null
  password_hash?: string
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

function generateId() {
  return randomBytes(16).toString("hex")
}

export const authService = {
  async register(email: string, password: string, displayName: string): Promise<User> {
    const id = generateId()
    const password_hash = hashPassword(password)
    try {
      const [user] = (await sql`
        INSERT INTO users (id, email, display_name, password_hash)
        VALUES (${id}, ${email}, ${displayName}, ${password_hash})
        RETURNING id, email, display_name
      `) as { id: string; email: string; display_name: string }[]
      // Set session (for demo: localStorage, replace with secure cookie in prod)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user_id", user.id)
      }
      return { id: user.id, email: user.email, displayName: user.display_name }
    } catch (error) {
      console.error("[v0] Error registering user:", error)
      throw error
    }
  },

  async login(email: string, password: string): Promise<User> {
    const password_hash = hashPassword(password)
    try {
      const [user] = (await sql`
        SELECT id, email, display_name FROM users WHERE email = ${email} AND password_hash = ${password_hash}
      `) as { id: string; email: string; display_name: string }[]
      if (!user) throw new Error("Invalid email or password")
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user_id", user.id)
      }
      return { id: user.id, email: user.email, displayName: user.display_name }
    } catch (error) {
      console.error("[v0] Error logging in:", error)
      throw error
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      let userId: string | null = null
      if (typeof window !== "undefined") {
        userId = window.localStorage.getItem("user_id")
      }
      if (!userId) return null
      const [user] = (await sql`
        SELECT id, email, display_name FROM users WHERE id = ${userId}
      `) as { id: string; email: string; display_name: string }[]
      if (!user) return null
      return { id: user.id, email: user.email, displayName: user.display_name }
    } catch (error) {
      console.error("[v0] Error getting current user:", error)
      return null
    }
  },

  async getUserId(): Promise<string | null> {
    try {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem("user_id")
      }
      return null
    } catch (error) {
      console.error("[v0] Error getting user ID:", error)
      return null
    }
  },

  async logout() {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user_id")
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("[v0] Error logging out:", error)
      throw error
    }
  },
}
