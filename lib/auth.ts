import { StackServerApp } from "@stackframe/stack"

const stack = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
})

export interface User {
  id: string
  email: string
  displayName: string | null
}

export const authService = {
  // Get current user from Stack Auth
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await stack.getUser()
      if (!user) return null

      return {
        id: user.id,
        email: user.primaryEmail || "",
        displayName: user.displayName,
      }
    } catch (error) {
      console.error("[v0] Error getting current user:", error)
      return null
    }
  },

  // Get user ID for database operations
  async getUserId(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser()
      return user?.id || null
    } catch (error) {
      console.error("[v0] Error getting user ID:", error)
      return null
    }
  },

  // Logout (redirect to Stack Auth)
  async logout() {
    try {
      // Stack Auth handles logout via redirect
      window.location.href = "/api/auth/signout"
    } catch (error) {
      console.error("[v0] Error logging out:", error)
      throw error
    }
  },
}
