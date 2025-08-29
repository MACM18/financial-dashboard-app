import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { BudgetTracker } from "@/components/dashboard/BudgetTracker"

export default function BudgetPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Tracker</h1>
          <p className="text-muted-foreground">
            Manage your monthly budget across different categories and track your spending.
          </p>
        </div>

        <BudgetTracker />
      </div>
    </DashboardLayout>
  )
}
