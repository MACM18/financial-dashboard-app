import { databases, Query } from "./appwrite"

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
const BUDGET_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BUDGET_COLLECTION_ID!
const SAVINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SAVINGS_COLLECTION_ID!
const DEBT_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DEBT_COLLECTION_ID!

// Budget Operations
export const budgetService = {
  async getBudgets(userId: string, month: string, year: number) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, BUDGET_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("month", month),
        Query.equal("year", year),
      ])
      return response.documents
    } catch (error) {
      console.error("Error fetching budgets:", error)
      throw error
    }
  },

  async createBudget(budgetData: {
    userId: string
    category: string
    budgetedAmount: number
    actualAmount: number
    notes: string
    month: string
    year: number
  }) {
    try {
      const response = await databases.createDocument(DATABASE_ID, BUDGET_COLLECTION_ID, "unique()", budgetData)
      return response
    } catch (error) {
      console.error("Error creating budget:", error)
      throw error
    }
  },

  async updateBudget(
    documentId: string,
    updates: {
      budgetedAmount?: number
      actualAmount?: number
      notes?: string
    },
  ) {
    try {
      const response = await databases.updateDocument(DATABASE_ID, BUDGET_COLLECTION_ID, documentId, updates)
      return response
    } catch (error) {
      console.error("Error updating budget:", error)
      throw error
    }
  },

  async deleteBudget(documentId: string) {
    try {
      await databases.deleteDocument(DATABASE_ID, BUDGET_COLLECTION_ID, documentId)
    } catch (error) {
      console.error("Error deleting budget:", error)
      throw error
    }
  },
}

// Savings Goals Operations
export const savingsService = {
  async getSavingsGoals(userId: string) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, SAVINGS_COLLECTION_ID, [
        Query.equal("userId", userId),
      ])
      return response.documents
    } catch (error) {
      console.error("Error fetching savings goals:", error)
      throw error
    }
  },

  async createSavingsGoal(goalData: {
    userId: string
    name: string
    targetAmount: number
    currentAmount: number
    monthlyContribution: number
    category: string
    targetDate?: string
    isCompleted: boolean
    createdAt: string
  }) {
    try {
      const response = await databases.createDocument(DATABASE_ID, SAVINGS_COLLECTION_ID, "unique()", goalData)
      return response
    } catch (error) {
      console.error("Error creating savings goal:", error)
      throw error
    }
  },

  async updateSavingsGoal(
    documentId: string,
    updates: {
      name?: string
      targetAmount?: number
      currentAmount?: number
      monthlyContribution?: number
      category?: string
      targetDate?: string
      isCompleted?: boolean
    },
  ) {
    try {
      const response = await databases.updateDocument(DATABASE_ID, SAVINGS_COLLECTION_ID, documentId, updates)
      return response
    } catch (error) {
      console.error("Error updating savings goal:", error)
      throw error
    }
  },

  async deleteSavingsGoal(documentId: string) {
    try {
      await databases.deleteDocument(DATABASE_ID, SAVINGS_COLLECTION_ID, documentId)
    } catch (error) {
      console.error("Error deleting savings goal:", error)
      throw error
    }
  },
}

// Debt Operations
export const debtService = {
  async getDebts(userId: string) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, DEBT_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("isActive", true),
      ])
      return response.documents
    } catch (error) {
      console.error("Error fetching debts:", error)
      throw error
    }
  },

  async createDebt(debtData: {
    userId: string
    name: string
    originalAmount: number
    currentBalance: number
    monthlyPayment: number
    interestRate: number
    minimumPayment: number
    dueDate: string
    isActive: boolean
    createdAt: string
  }) {
    try {
      const response = await databases.createDocument(DATABASE_ID, DEBT_COLLECTION_ID, "unique()", debtData)
      return response
    } catch (error) {
      console.error("Error creating debt:", error)
      throw error
    }
  },

  async updateDebt(
    documentId: string,
    updates: {
      name?: string
      currentBalance?: number
      monthlyPayment?: number
      interestRate?: number
      minimumPayment?: number
      dueDate?: string
      isActive?: boolean
    },
  ) {
    try {
      const response = await databases.updateDocument(DATABASE_ID, DEBT_COLLECTION_ID, documentId, updates)
      return response
    } catch (error) {
      console.error("Error updating debt:", error)
      throw error
    }
  },

  async deleteDebt(documentId: string) {
    try {
      await databases.deleteDocument(DATABASE_ID, DEBT_COLLECTION_ID, documentId)
    } catch (error) {
      console.error("Error deleting debt:", error)
      throw error
    }
  },
}
