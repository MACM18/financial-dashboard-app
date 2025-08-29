import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { SavingsGoals } from "@/components/dashboard/SavingsGoals"

export default function SavingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
          <p className="text-muted-foreground">Track your progress towards your financial goals.</p>
        </div>

        <SavingsGoals />
      </div>
    </DashboardLayout>
  )
}
