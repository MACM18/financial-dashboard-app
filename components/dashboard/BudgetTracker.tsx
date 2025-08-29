"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Edit2, Check, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./LoadingSpinner"
import { EmptyState } from "./EmptyState"
import { useAuth } from "@/contexts/AuthContext"
import { budgetService } from "@/lib/database"

interface BudgetItem {
  $id: string
  category: string
  budgetedAmount: number
  actualAmount: number
  notes: string
  type: "income" | "expense"
}

const defaultCategories = [
  { category: "Income", budgetedAmount: 0, actualAmount: 0, notes: "Monthly salary", type: "income" as const },
  {
    category: "Subscriptions",
    budgetedAmount: 0,
    actualAmount: 0,
    notes: "Netflix, Spotify, etc.",
    type: "expense" as const,
  },
  { category: "Food", budgetedAmount: 0, actualAmount: 0, notes: "Groceries and dining", type: "expense" as const },
  { category: "Travel", budgetedAmount: 0, actualAmount: 0, notes: "Gas and transportation", type: "expense" as const },
  {
    category: "Debt Repayment",
    budgetedAmount: 0,
    actualAmount: 0,
    notes: "Credit card payment",
    type: "expense" as const,
  },
  { category: "Savings", budgetedAmount: 0, actualAmount: 0, notes: "Emergency fund", type: "expense" as const },
]

export function BudgetTracker() {
  const { user } = useAuth()
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<BudgetItem>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString("default", { month: "long" })
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    if (user) {
      loadBudgetData()
    }
  }, [user])

  const loadBudgetData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const budgets = await budgetService.getBudgets(user.$id, currentMonth, currentYear)

      if (budgets.length === 0) {
        const createdBudgets = []
        for (const category of defaultCategories) {
          const newBudget = await budgetService.createBudget({
            userId: user.$id,
            month: currentMonth,
            year: currentYear,
            ...category,
          })
          createdBudgets.push(newBudget)
        }
        setBudgetData(createdBudgets)
      } else {
        setBudgetData(budgets)
      }
    } catch (error) {
      console.error("Error loading budget data:", error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (item: BudgetItem) => {
    setEditingId(item.$id)
    setEditValues({
      budgetedAmount: item.budgetedAmount,
      actualAmount: item.actualAmount,
      notes: item.notes,
    })
  }

  const saveEdit = async () => {
    if (!editingId) return

    try {
      setSaving(true)
      const updatedBudget = await budgetService.updateBudget(editingId, {
        budgetedAmount: editValues.budgetedAmount,
        actualAmount: editValues.actualAmount,
        notes: editValues.notes,
      })

      setBudgetData((prev) => prev.map((item) => (item.$id === editingId ? updatedBudget : item)))
      setEditingId(null)
      setEditValues({})
    } catch (error) {
      console.error("Error saving budget:", error)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getProgressPercentage = (actual: number, budgeted: number) => {
    if (budgeted === 0) return 0
    return Math.min((actual / budgeted) * 100, 100)
  }

  // Calculate totals
  const totalIncome = budgetData
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.actualAmount, 0)

  const totalExpenses = budgetData
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.actualAmount, 0)

  const totalBudgetedExpenses = budgetData
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.budgetedAmount, 0)

  const remainingBudget = totalIncome - totalExpenses

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (budgetData.length === 0) {
    return (
      <EmptyState
        icon={<Plus className="h-6 w-6" />}
        title="No budget categories yet"
        description="Start by adding your first budget category to track your income and expenses."
        action={{
          label: "Add Category",
          onClick: () => console.log("Add category"),
        }}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Budget Tracker</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track your income and expenses for {currentMonth} {currentYear}
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  remainingBudget >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                )}
              >
                {formatCurrency(remainingBudget)}
              </p>
            </div>
          </div>

          {/* Budget Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Budgeted</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actual</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Progress</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Notes</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.map((item) => (
                  <tr key={item.$id} className="border-b border-border/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.category}</span>
                        <Badge variant={item.type === "income" ? "default" : "secondary"} className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {editingId === item.$id ? (
                        <Input
                          type="number"
                          value={editValues.budgetedAmount ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              budgetedAmount: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-24"
                          disabled={saving}
                        />
                      ) : (
                        <span className="font-medium">{formatCurrency(item.budgetedAmount)}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {editingId === item.$id ? (
                        <Input
                          type="number"
                          value={editValues.actualAmount ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              actualAmount: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-24"
                          disabled={saving}
                        />
                      ) : (
                        <span className="font-medium">{formatCurrency(item.actualAmount)}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={getProgressPercentage(item.actualAmount, item.budgetedAmount)}
                          className="w-16 h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(getProgressPercentage(item.actualAmount, item.budgetedAmount))}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {editingId === item.$id ? (
                        <Input
                          value={editValues.notes ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          className="w-32"
                          placeholder="Add notes..."
                          disabled={saving}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">{item.notes || "No notes"}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {editingId === item.$id ? (
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={saveEdit} disabled={saving}>
                            {saving ? <LoadingSpinner size="sm" /> : <Check className="h-3 w-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => startEditing(item)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Budget vs Actual Summary */}
          <div className="mt-6 p-4 bg-card rounded-lg border border-border">
            <h4 className="font-medium mb-3">Budget Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Budgeted Expenses</p>
                <p className="text-lg font-semibold">{formatCurrency(totalBudgetedExpenses)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Utilization</p>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={getProgressPercentage(totalExpenses, totalBudgetedExpenses)}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-medium">
                    {Math.round(getProgressPercentage(totalExpenses, totalBudgetedExpenses))}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
