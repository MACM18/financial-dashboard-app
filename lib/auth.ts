import { account } from "./appwrite"
import { ID } from "appwrite"

export interface User {
  $id: string
  email: string
  name: string
}

export const authService = {
  // Create account
  async createAccount(email: string, password: string, name: string) {
    try {
      const userAccount = await account.create(ID.unique(), email, password, name)
      if (userAccount) {
        return await this.login(email, password)
      } else {
        return userAccount
      }
    } catch (error) {
      throw error
    }
  },

  // Login
  async login(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password)
    } catch (error) {
      throw error
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      return await account.get()
    } catch (error) {
      return null
    }
  },

  // Logout
  async logout() {
    try {
      return await account.deleteSessions()
    } catch (error) {
      throw error
    }
  },
}
