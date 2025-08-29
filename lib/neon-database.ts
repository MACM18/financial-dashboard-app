import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Types
export interface Budget {
  id: number
  user_id: string
  category: string
  budgeted_amount: number
  actual_amount: number
  notes?: string
  month: string
  year: number
  created_at: string
  updated_at: string
}

export interface SavingsGoal {
  id: number
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  category: string
  target_date?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Debt {
  id: number
  user_id: string
  name: string
  original_amount: number
  current_balance: number
  monthly_payment: number
  interest_rate: number
  minimum_payment: number
  due_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DebtPayment {
  id: number
  user_id: string
  debt_id: number
  amount: number
  payment_date: string
  month: string
  year: number
  is_paid: boolean
  created_at: string
}

export interface UserPreferences {
  id: number
  user_id: string
  currency: string
  theme: string
  notifications: boolean
  budget_alerts: boolean
  monthly_budget?: number
  created_at: string
  updated_at: string
}

// Budget Service
export const budgetService = {
  async getBudgets(userId: string, month?: string, year?: number): Promise<Budget[]> {
    console.log("[v0] Getting budgets for user:", userId, month, year)
    try {
      if (month && year) {
        return await sql`
          SELECT * FROM budgets 
          WHERE user_id = ${userId} AND month = ${month} AND year = ${year}
          ORDER BY category
        `
      }
      return await sql`
        SELECT * FROM budgets 
        WHERE user_id = ${userId}
        ORDER BY year DESC, month DESC, category
      `
    } catch (error) {
      console.error("[v0] Error getting budgets:", error)
      throw error
    }
  },

  async createBudget(budget: Omit<Budget, "id" | "created_at" | "updated_at">): Promise<Budget> {
    console.log("[v0] Creating budget:", budget)
    try {
      const [newBudget] = await sql`
        INSERT INTO budgets (user_id, category, budgeted_amount, actual_amount, notes, month, year)
        VALUES (${budget.user_id}, ${budget.category}, ${budget.budgeted_amount}, ${budget.actual_amount}, ${budget.notes}, ${budget.month}, ${budget.year})
        RETURNING *
      `
      return newBudget
    } catch (error) {
      console.error("[v0] Error creating budget:", error)
      throw error
    }
  },

  async updateBudget(id: number, updates: Partial<Budget>): Promise<Budget> {
    console.log("[v0] Updating budget:", id, updates)
    try {
      const [updatedBudget] = await sql`
        UPDATE budgets 
        SET budgeted_amount = COALESCE(${updates.budgeted_amount}, budgeted_amount),
            actual_amount = COALESCE(${updates.actual_amount}, actual_amount),
            notes = COALESCE(${updates.notes}, notes),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return updatedBudget
    } catch (error) {
      console.error("[v0] Error updating budget:", error)
      throw error
    }
  },

  async initializeDefaultBudgets(userId: string): Promise<Budget[]> {
    console.log("[v0] Initializing default budgets for user:", userId)
    const currentDate = new Date()
    const month = currentDate.toLocaleString("default", { month: "long" })
    const year = currentDate.getFullYear()

    const defaultCategories = ["Income", "Subscriptions", "Food", "Travel", "Debt Repayment", "Savings"]

    try {
      const budgets = []
      for (const category of defaultCategories) {
        const budget = await this.createBudget({
          user_id: userId,
          category,
          budgeted_amount: 0,
          actual_amount: 0,
          notes: "",
          month,
          year,
        })
        budgets.push(budget)
      }
      return budgets
    } catch (error) {
      console.error("[v0] Error initializing default budgets:", error)
      throw error
    }
  },
}

// Savings Goals Service
export const savingsService = {
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    console.log("[v0] Getting savings goals for user:", userId)
    try {
      return await sql`
        SELECT * FROM savings_goals 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `
    } catch (error) {
      console.error("[v0] Error getting savings goals:", error)
      throw error
    }
  },

  async createSavingsGoal(goal: Omit<SavingsGoal, "id" | "created_at" | "updated_at">): Promise<SavingsGoal> {
    console.log("[v0] Creating savings goal:", goal)
    try {
      const [newGoal] = await sql`
        INSERT INTO savings_goals (user_id, name, target_amount, current_amount, monthly_contribution, category, target_date, is_completed)
        VALUES (${goal.user_id}, ${goal.name}, ${goal.target_amount}, ${goal.current_amount}, ${goal.monthly_contribution}, ${goal.category}, ${goal.target_date}, ${goal.is_completed})
        RETURNING *
      `
      return newGoal
    } catch (error) {
      console.error("[v0] Error creating savings goal:", error)
      throw error
    }
  },

  async updateSavingsGoal(id: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    console.log("[v0] Updating savings goal:", id, updates)
    try {
      const [updatedGoal] = await sql`
        UPDATE savings_goals 
        SET current_amount = COALESCE(${updates.current_amount}, current_amount),
            target_amount = COALESCE(${updates.target_amount}, target_amount),
            monthly_contribution = COALESCE(${updates.monthly_contribution}, monthly_contribution),
            name = COALESCE(${updates.name}, name),
            category = COALESCE(${updates.category}, category),
            target_date = COALESCE(${updates.target_date}, target_date),
            is_completed = COALESCE(${updates.is_completed}, is_completed),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return updatedGoal
    } catch (error) {
      console.error("[v0] Error updating savings goal:", error)
      throw error
    }
  },

  async deleteSavingsGoal(id: number): Promise<void> {
    console.log("[v0] Deleting savings goal:", id)
    try {
      await sql`DELETE FROM savings_goals WHERE id = ${id}`
    } catch (error) {
      console.error("[v0] Error deleting savings goal:", error)
      throw error
    }
  },
}

// Debt Service
export const debtService = {
  async getDebts(userId: string): Promise<Debt[]> {
    console.log("[v0] Getting debts for user:", userId)
    try {
      return await sql`
        SELECT * FROM debts 
        WHERE user_id = ${userId} AND is_active = true
        ORDER BY created_at DESC
      `
    } catch (error) {
      console.error("[v0] Error getting debts:", error)
      throw error
    }
  },

  async createDebt(debt: Omit<Debt, "id" | "created_at" | "updated_at">): Promise<Debt> {
    console.log("[v0] Creating debt:", debt)
    try {
      const [newDebt] = await sql`
        INSERT INTO debts (user_id, name, original_amount, current_balance, monthly_payment, interest_rate, minimum_payment, due_date, is_active)
        VALUES (${debt.user_id}, ${debt.name}, ${debt.original_amount}, ${debt.current_balance}, ${debt.monthly_payment}, ${debt.interest_rate}, ${debt.minimum_payment}, ${debt.due_date}, ${debt.is_active})
        RETURNING *
      `
      return newDebt
    } catch (error) {
      console.error("[v0] Error creating debt:", error)
      throw error
    }
  },

  async updateDebt(id: number, updates: Partial<Debt>): Promise<Debt> {
    console.log("[v0] Updating debt:", id, updates)
    try {
      const [updatedDebt] = await sql`
        UPDATE debts 
        SET current_balance = COALESCE(${updates.current_balance}, current_balance),
            monthly_payment = COALESCE(${updates.monthly_payment}, monthly_payment),
            interest_rate = COALESCE(${updates.interest_rate}, interest_rate),
            minimum_payment = COALESCE(${updates.minimum_payment}, minimum_payment),
            due_date = COALESCE(${updates.due_date}, due_date),
            is_active = COALESCE(${updates.is_active}, is_active),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return updatedDebt
    } catch (error) {
      console.error("[v0] Error updating debt:", error)
      throw error
    }
  },

  async deleteDebt(id: number): Promise<void> {
    console.log("[v0] Deleting debt:", id)
    try {
      await sql`UPDATE debts SET is_active = false WHERE id = ${id}`
    } catch (error) {
      console.error("[v0] Error deleting debt:", error)
      throw error
    }
  },
}

// Dashboard Statistics Service
export const dashboardService = {
  async getDashboardStats(userId: string) {
    console.log("[v0] Getting dashboard stats for user:", userId)
    try {
      const currentDate = new Date()
      const month = currentDate.toLocaleString("default", { month: "long" })
      const year = currentDate.getFullYear()

      // Get current month's budget data
      const budgets = await budgetService.getBudgets(userId, month, year)
      const savingsGoals = await savingsService.getSavingsGoals(userId)
      const debts = await debtService.getDebts(userId)

      // Calculate totals
      const totalBudget = budgets.reduce((sum, b) => sum + Number(b.budgeted_amount), 0)
      const totalSpending = budgets.reduce((sum, b) => sum + Number(b.actual_amount), 0)
      const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + Number(g.target_amount), 0)
      const totalSavingsCurrent = savingsGoals.reduce((sum, g) => sum + Number(g.current_amount), 0)
      const totalDebt = debts.reduce((sum, d) => sum + Number(d.current_balance), 0)

      const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0

      return {
        totalBudget,
        totalSpending,
        savingsProgress: Math.round(savingsProgress),
        totalDebt,
        budgetUtilization: totalBudget > 0 ? Math.round((totalSpending / totalBudget) * 100) : 0,
      }
    } catch (error) {
      console.error("[v0] Error getting dashboard stats:", error)
      throw error
    }
  },
}

// User Preferences Service
export const userPreferencesService = {
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    console.log("[v0] Getting user preferences for:", userId)
    try {
      const [preferences] = await sql`
        SELECT * FROM user_preferences WHERE user_id = ${userId}
      `
      return preferences || null
    } catch (error) {
      console.error("[v0] Error getting user preferences:", error)
      throw error
    }
  },

  async createOrUpdateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    console.log("[v0] Creating/updating user preferences:", userId, preferences)
    try {
      const [updatedPreferences] = await sql`
        INSERT INTO user_preferences (user_id, currency, theme, notifications, budget_alerts, monthly_budget)
        VALUES (${userId}, ${preferences.currency || "USD"}, ${preferences.theme || "system"}, ${preferences.notifications ?? true}, ${preferences.budget_alerts ?? true}, ${preferences.monthly_budget})
        ON CONFLICT (user_id) 
        DO UPDATE SET
          currency = COALESCE(${preferences.currency}, user_preferences.currency),
          theme = COALESCE(${preferences.theme}, user_preferences.theme),
          notifications = COALESCE(${preferences.notifications}, user_preferences.notifications),
          budget_alerts = COALESCE(${preferences.budget_alerts}, user_preferences.budget_alerts),
          monthly_budget = COALESCE(${preferences.monthly_budget}, user_preferences.monthly_budget),
          updated_at = NOW()
        RETURNING *
      `
      return updatedPreferences
    } catch (error) {
      console.error("[v0] Error creating/updating user preferences:", error)
      throw error
    }
  },
}
