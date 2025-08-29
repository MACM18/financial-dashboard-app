import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { BudgetTracker } from "@/components/dashboard/BudgetTracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your financial status.</p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Budget Tracker */}
        <BudgetTracker />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest financial transactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Grocery Shopping</p>
                    <p className="text-sm text-muted-foreground">Food & Dining</p>
                  </div>
                  <span className="text-red-600 dark:text-red-400">-$127.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Salary Deposit</p>
                    <p className="text-sm text-muted-foreground">Income</p>
                  </div>
                  <span className="text-green-600 dark:text-green-400">+$3,200.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Emergency Fund</p>
                    <p className="text-sm text-muted-foreground">Savings Goal</p>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400">+$500.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to manage your finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <p className="font-medium">Update Budget</p>
                  <p className="text-sm text-muted-foreground">Adjust your monthly budget categories</p>
                </div>
                <div className="p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <p className="font-medium">Add Savings Goal</p>
                  <p className="text-sm text-muted-foreground">Set a new financial target</p>
                </div>
                <div className="p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <p className="font-medium">Record Payment</p>
                  <p className="text-sm text-muted-foreground">Log a debt payment or expense</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
