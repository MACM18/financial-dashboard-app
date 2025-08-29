import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { DebtTracker } from "@/components/dashboard/DebtTracker"

export default function DebtPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Debt Tracker</h1>
          <p className="text-muted-foreground">Monitor your debt repayment progress and stay on track.</p>
        </div>

        <DebtTracker />
      </div>
    </DashboardLayout>
  )
}
