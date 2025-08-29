"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { dashboardService } from "@/lib/neon-database"
import { authService } from "@/lib/simple-auth"
import { LoadingSpinner } from "./LoadingSpinner"

interface DashboardStat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ComponentType<{ className?: string }>
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  console.log("[v0] DashboardStats rendering, userId:", userId, "loading:", loading)

  useEffect(() => {
    loadUserAndStats()
  }, [])

  const loadUserAndStats = async () => {
    try {
      console.log("[v0] Loading user and dashboard stats")
      setLoading(true)

      // Get current user ID
      const currentUserId = await authService.getUserId()
      if (!currentUserId) {
        console.log("[v0] No user found, using demo user")
        return
      }

      setUserId(currentUserId)
      console.log("[v0] User ID:", currentUserId)

      // Load dashboard statistics from Neon database
      const dashboardStats = await dashboardService.getDashboardStats(currentUserId)
      console.log("[v0] Dashboard stats loaded:", dashboardStats)

      const calculatedStats: DashboardStat[] = [
        {
          title: "Total Budget",
          value: formatCurrency(dashboardStats.totalBudget),
          change: dashboardStats.totalBudget > 0 ? "+2.5%" : "Set up your budget",
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          title: "Monthly Spending",
          value: formatCurrency(dashboardStats.totalSpending),
          change:
            dashboardStats.budgetUtilization > 0
              ? `${dashboardStats.budgetUtilization}% of budget`
              : "No spending tracked",
          trend: dashboardStats.budgetUtilization < 80 ? "down" : "up",
          icon: TrendingDown,
        },
        {
          title: "Savings Progress",
          value: `${dashboardStats.savingsProgress}%`,
          change: dashboardStats.savingsProgress > 0 ? "+5% this month" : "Create savings goals",
          trend: "up" as const,
          icon: Target,
        },
        {
          title: "Debt Remaining",
          value: formatCurrency(dashboardStats.totalDebt),
          change: dashboardStats.totalDebt > 0 ? "-$350" : "No debts tracked",
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
