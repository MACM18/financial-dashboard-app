"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Target, TrendingUp, Calendar, DollarSign, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./LoadingSpinner"
import { EmptyState } from "./EmptyState"
import { useAuth } from "@/contexts/AuthContext"
import { savingsService } from "@/lib/database"

interface SavingsGoal {
  $id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  targetDate?: string
  category: string
  isCompleted: boolean
}

const categoryColors: { [key: string]: string } = {
  Emergency: "bg-red-500",
  Entertainment: "bg-orange-500",
  Technology: "bg-blue-500",
  Travel: "bg-green-500",
  Education: "bg-purple-500",
  Health: "bg-pink-500",
  Other: "bg-gray-500",
}

export function SavingsGoals() {
  const { user } = useAuth()
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [updateAmount, setUpdateAmount] = useState("")
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    monthlyContribution: "",
    category: "Other",
    targetDate: "",
  })

  useEffect(() => {
    if (user) {
      loadSavingsGoals()
    }
  }, [user])

  const loadSavingsGoals = async () => {
    if (!user) return

    try {
      setLoading(true)
      const goals = await savingsService.getSavingsGoals(user.$id)
      setSavingsGoals(goals)
    } catch (error) {
      console.error("Error loading savings goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const createSavingsGoal = async () => {
    if (!user || !newGoal.name || !newGoal.targetAmount || !newGoal.monthlyContribution) return

    try {
      const goalData = {
        userId: user.$id,
        name: newGoal.name,
        targetAmount: Number.parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        monthlyContribution: Number.parseFloat(newGoal.monthlyContribution),
        category: newGoal.category,
        targetDate: newGoal.targetDate || undefined,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      }

      const createdGoal = await savingsService.createSavingsGoal(goalData)
      setSavingsGoals((prev) => [...prev, createdGoal])
      setNewGoal({ name: "", targetAmount: "", monthlyContribution: "", category: "Other", targetDate: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error creating savings goal:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getMonthsToGoal = (current: number, target: number, monthlyContribution: number) => {
    if (monthlyContribution <= 0) return "∞"
    const remaining = target - current
    if (remaining <= 0) return "0"
    return Math.ceil(remaining / monthlyContribution)
  }

  const updateGoalProgress = async (goalId: string, additionalAmount: number) => {
    try {
      const goal = savingsGoals.find((g) => g.$id === goalId)
      if (!goal) return

      const newCurrentAmount = goal.currentAmount + additionalAmount
      const isCompleted = newCurrentAmount >= goal.targetAmount

      const updatedGoal = await savingsService.updateSavingsGoal(goalId, {
        currentAmount: newCurrentAmount,
        isCompleted,
      })

      setSavingsGoals((prev) => prev.map((g) => (g.$id === goalId ? updatedGoal : g)))
      setEditingGoal(null)
      setUpdateAmount("")
    } catch (error) {
      console.error("Error updating goal progress:", error)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-gray-400"
  }

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalMonthlyContributions = savingsGoals.reduce((sum, goal) => sum + goal.monthlyContribution, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (savingsGoals.length === 0) {
    return (
      <EmptyState
        icon={<Target className="h-6 w-6" />}
        title="No savings goals yet"
        description="Create your first savings goal to start tracking your financial progress."
        action={{
          label: "Add Goal",
          onClick: () => setIsAddDialogOpen(true),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalSaved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalTarget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Contributions</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalMonthlyContributions)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Savings Goals</h2>
          <p className="text-muted-foreground">Track your progress towards financial milestones</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Savings Goal</DialogTitle>
              <DialogDescription>Create a new savings goal to track your financial progress.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="10000"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, targetAmount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  placeholder="500"
                  value={newGoal.monthlyContribution}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, monthlyContribution: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded-md"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Technology">Technology</option>
                  <option value="Travel">Travel</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="targetDate">Target Date (Optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
              <Button className="w-full" onClick={createSavingsGoal}>
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount)
          const monthsToGoal = getMonthsToGoal(goal.currentAmount, goal.targetAmount, goal.monthlyContribution)
          const isCompleted = goal.isCompleted || progressPercentage >= 100

          return (
            <Card key={goal.$id} className={cn("relative overflow-hidden", isCompleted && "ring-2 ring-green-500")}>
              {/* Color accent bar */}
              <div
                className={cn("absolute top-0 left-0 right-0 h-1", categoryColors[goal.category] || "bg-gray-500")}
              />

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {goal.category}
                    </Badge>
                  </div>
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-500 text-white">
                      Complete!
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Amounts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target</span>
                    <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(goal.monthlyContribution)}
                    </span>
                  </div>
                </div>

                {/* Time to goal */}
                {!isCompleted && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{monthsToGoal === "∞" ? "No monthly contribution" : `${monthsToGoal} months to goal`}</span>
                  </div>
                )}

                {/* Target date */}
                {goal.targetDate && (
                  <div className="text-sm text-muted-foreground">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}

                {/* Update Progress Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setEditingGoal(goal)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Update Progress
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Progress: {goal.name}</DialogTitle>
                      <DialogDescription>Add money to your savings goal.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="updateAmount">Amount to Add</Label>
                        <Input
                          id="updateAmount"
                          type="number"
                          placeholder="100"
                          value={updateAmount}
                          onChange={(e) => setUpdateAmount(e.target.value)}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current: {formatCurrency(goal.currentAmount)} → New:{" "}
                        {formatCurrency(goal.currentAmount + (Number.parseFloat(updateAmount) || 0))}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => updateGoalProgress(goal.$id, Number.parseFloat(updateAmount) || 0)}
                        disabled={!updateAmount || Number.parseFloat(updateAmount) <= 0}
                      >
                        Update Progress
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Savings Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Progress</span>
              <span className="font-semibold">{Math.round(getProgressPercentage(totalSaved, totalTarget))}%</span>
            </div>
            <Progress value={getProgressPercentage(totalSaved, totalTarget)} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Remaining to save:</span>
                <p className="font-semibold text-lg">{formatCurrency(totalTarget - totalSaved)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">At current rate:</span>
                <p className="font-semibold text-lg">
                  {totalMonthlyContributions > 0
                    ? `${Math.ceil((totalTarget - totalSaved) / totalMonthlyContributions)} months`
                    : "∞ months"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
