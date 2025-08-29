"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { BudgetTracker } from "@/components/dashboard/BudgetTracker"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function BudgetPage() {
  const handleAddBudget = () => {
    console.log("[v0] Add Budget button clicked")
    alert("Add Budget functionality - coming soon!")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Tracker</h1>
            <p className="text-muted-foreground">
              Manage your monthly budget across different categories and track your spending.
            </p>
          </div>
          <Button onClick={handleAddBudget} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Budget
          </Button>
        </div>

        <BudgetTracker />
      </div>
    </DashboardLayout>
  )
}
