"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { budgetService, savingsService, debtService } from "@/lib/database"
import { LoadingSpinner } from "./LoadingSpinner"

interface DashboardStat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ComponentType<{ className?: string }>
}

export function DashboardStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)

  console.log("[v0] DashboardStats rendering, user:", user?.$id, "loading:", loading)

  useEffect(() => {
    if (user) {
      loadDashboardStats()
    }
  }, [user])

  const loadDashboardStats = async () => {
    if (!user) return

    try {
      console.log("[v0] Loading dashboard stats for user:", user.$id)
      setLoading(true)

      const currentDate = new Date()
      const currentMonth = currentDate.toLocaleString("default", { month: "long" })
      const currentYear = currentDate.getFullYear()

      const [budgets, savingsGoals, debts] = await Promise.all([
        budgetService.getBudgets(user.$id, currentMonth, currentYear),
        savingsService.getSavingsGoals(user.$id),
        debtService.getDebts(user.$id),
      ])

      console.log("[v0] Loaded data:", { budgets: budgets.length, savings: savingsGoals.length, debts: debts.length })

      // Calculate total budget (income)
      const totalIncome = budgets
        .filter((budget: any) => budget.category === "Income")
        .reduce((sum: number, budget: any) => sum + budget.budgetedAmount, 0)

      // Calculate total spending (actual expenses)
      const totalSpending = budgets
        .filter((budget: any) => budget.category !== "Income")
        .reduce((sum: number, budget: any) => sum + budget.actualAmount, 0)

      // Calculate savings progress
      const totalSaved = savingsGoals.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0)
      const totalSavingsTarget = savingsGoals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0)
      const savingsProgress = totalSavingsTarget > 0 ? (totalSaved / totalSavingsTarget) * 100 : 0

      // Calculate total debt
      const totalDebt = debts.reduce((sum: number, debt: any) => sum + debt.currentBalance, 0)

      const calculatedStats: DashboardStat[] = [
        {
          title: "Total Budget",
          value: formatCurrency(totalIncome),
          change: totalIncome > 0 ? "+2.5%" : "No income set",
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          title: "Monthly Spending",
          value: formatCurrency(totalSpending),
          change: totalIncome > 0 ? `${Math.round((totalSpending / totalIncome) * 100)}% of budget` : "No budget set",
          trend: totalSpending < totalIncome ? "down" : "up",
          icon: TrendingDown,
        },
        {
          title: "Savings Progress",
          value: `${Math.round(savingsProgress)}%`,
          change: savingsGoals.length > 0 ? `${savingsGoals.length} active goals` : "No goals set",
          trend: "up" as const,
          icon: Target,
        },
        {
          title: "Debt Remaining",
          value: formatCurrency(totalDebt),
          change: debts.length > 0 ? `${debts.length} active debts` : "No debts tracked",
          trend: "down" as const,
          icon: TrendingUp,
        },
      ]

      console.log("[v0] Calculated stats:", calculatedStats)
      setStats(calculatedStats)
    } catch (error) {
      console.error("[v0] Error loading dashboard stats:", error)
      setStats([
        {
          title: "Total Budget",
          value: "$0",
          change: "Set up your budget",
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          title: "Monthly Spending",
          value: "$0",
          change: "No spending tracked",
          trend: "down" as const,
          icon: TrendingDown,
        },
        {
          title: "Savings Progress",
          value: "0%",
          change: "Create savings goals",
          trend: "up" as const,
          icon: Target,
        },
        {
          title: "Debt Remaining",
          value: "$0",
          change: "No debts tracked",
          trend: "down" as const,
          icon: TrendingUp,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-24">
              <LoadingSpinner size="sm" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
