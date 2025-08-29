export interface User {
  id: string
  email: string
  displayName: string | null
}

// Mock user for development - replace with real auth later
const mockUser: User = {
  id: "user_123",
  email: "demo@example.com",
  displayName: "Demo User",
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    // Return mock user for now
    return mockUser
  },

  async getUserId(): Promise<string | null> {
    return mockUser.id
  },

  async logout() {
    // Redirect to home page
    window.location.href = "/"
  },
}
