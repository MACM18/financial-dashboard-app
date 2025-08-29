"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { DebtTracker } from "@/components/dashboard/DebtTracker"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DebtPage() {
  const handleAddDebt = () => {
    console.log("[v0] Add Debt button clicked")
    alert("Add Debt functionality - coming soon!")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Debt Tracker</h1>
            <p className="text-muted-foreground">Monitor your debt repayment progress and stay on track.</p>
          </div>
          <Button onClick={handleAddDebt} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Debt
          </Button>
        </div>

        <DebtTracker />
      </div>
    </DashboardLayout>
  )
}
