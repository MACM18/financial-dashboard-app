"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"

// Mock data - will be replaced with real data later
const stats = [
  {
    title: "Total Budget",
    value: "$4,200",
    change: "+2.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Monthly Spending",
    value: "$3,847",
    change: "-8.2%",
    trend: "down" as const,
    icon: TrendingDown,
  },
  {
    title: "Savings Progress",
    value: "65%",
    change: "+5% this month",
    trend: "up" as const,
    icon: Target,
  },
  {
    title: "Debt Remaining",
    value: "$12,450",
    change: "-$350",
    trend: "down" as const,
    icon: TrendingUp,
  },
]

export function DashboardStats() {
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
