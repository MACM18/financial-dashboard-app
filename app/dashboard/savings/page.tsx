"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { SavingsGoals } from "@/components/dashboard/SavingsGoals"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function SavingsPage() {
  const handleAddGoal = () => {
    console.log("[v0] Add Goal button clicked")
    alert("Add Savings Goal functionality - coming soon!")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">Track your progress towards your financial goals.</p>
          </div>
          <Button onClick={handleAddGoal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>

        <SavingsGoals />
      </div>
    </DashboardLayout>
  )
}
