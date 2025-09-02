"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BudgetTracker } from "@/components/dashboard/BudgetTracker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertCircle,
  PieChart,
  Calendar,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  notes: string;
  month: string;
  year: number;
}

interface TransactionSummary {
  categoryName: string;
  total: number;
  count: number;
  color: string;
}

interface BudgetAnalytics {
  totalBudgeted: number;
  totalSpent: number;
  variance: number;
  variancePercentage: number;
  categoriesOverBudget: number;
  topSpendingCategories: TransactionSummary[];
  budgetUtilization: number;
  onTrackCategories: number;
}

interface Transaction {
  id: string;
  amount: number;
  category?: {
    name: string;
    color?: string;
  };
  // Add other fields as needed
}

export default function BudgetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<
    TransactionSummary[]
  >([]);
  const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showActualAmounts, setShowActualAmounts] = useState(true);
  const [newBudget, setNewBudget] = useState({
    category: "",
    budgetedAmount: "",
    actualAmount: "",
    notes: "",
  });

  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (user) {
      loadBudgetData();
    }
  }, [user]);

  const loadBudgetData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load budgets and transaction summary in parallel
      const [budgetsResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`, {
          headers: { Authorization: `Bearer ${user.id}` },
        }),
        fetch(
          `/api/transactions?limit=1000&month=${currentMonth}&year=${currentYear}`,
          {
            headers: { Authorization: `Bearer ${user.id}` },
          }
        ),
      ]);

      if (!budgetsResponse.ok) throw new Error("Failed to fetch budgets");
      if (!transactionsResponse.ok)
        throw new Error("Failed to fetch transactions");

      const budgetsData = await budgetsResponse.json();
      const transactionsData = await transactionsResponse.json();

      const budgetsList = budgetsData.budgets || [];
      setBudgets(budgetsList);

      // Calculate transaction summary by category
      const transactions: Transaction[] = transactionsData.transactions || [];
      const categoryTotals = new Map<
        string,
        { total: number; count: number; color: string }
      >();

      transactions.forEach((transaction: Transaction) => {
        if (transaction.amount < 0) {
          // Only expenses
          const categoryName = transaction.category?.name || "Uncategorized";
          const amount = Math.abs(transaction.amount);
          const existing = categoryTotals.get(categoryName) || {
            total: 0,
            count: 0,
            color: transaction.category?.color || "gray",
          };
          categoryTotals.set(categoryName, {
            total: existing.total + amount,
            count: existing.count + 1,
            color: existing.color,
          });
        }
      });

      const summary: TransactionSummary[] = Array.from(categoryTotals.entries())
        .map(([name, data]) => ({
          categoryName: name,
          total: data.total,
          count: data.count,
          color: data.color,
        }))
        .sort((a, b) => b.total - a.total);

      setTransactionSummary(summary);

      // Calculate analytics
      const totalBudgeted = budgetsList.reduce(
        (sum: number, b: Budget) => sum + Number(b.budgetedAmount),
        0
      );
      const totalActualFromBudgets = budgetsList.reduce(
        (sum: number, b: Budget) => sum + Number(b.actualAmount),
        0
      );
      const totalSpentFromTransactions = summary.reduce(
        (sum, s) => sum + s.total,
        0
      );

      // Use transaction data for more accurate spent amount
      const totalSpent = Math.max(
        totalActualFromBudgets,
        totalSpentFromTransactions
      );
      const variance = totalBudgeted - totalSpent;
      const variancePercentage =
        totalBudgeted > 0 ? (variance / totalBudgeted) * 100 : 0;

      const categoriesOverBudget = budgetsList.filter((b: Budget) => {
        const actualSpent =
          summary.find(
            (s) => s.categoryName.toLowerCase() === b.category.toLowerCase()
          )?.total || b.actualAmount;
        return actualSpent > b.budgetedAmount && b.budgetedAmount > 0;
      }).length;

      const onTrackCategories = budgetsList.filter((b: Budget) => {
        const actualSpent =
          summary.find(
            (s) => s.categoryName.toLowerCase() === b.category.toLowerCase()
          )?.total || b.actualAmount;
        return actualSpent <= b.budgetedAmount && b.budgetedAmount > 0;
      }).length;

      setAnalytics({
        totalBudgeted,
        totalSpent,
        variance,
        variancePercentage,
        categoriesOverBudget,
        topSpendingCategories: summary.slice(0, 5),
        budgetUtilization:
          totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
        onTrackCategories,
      });
    } catch (error) {
      console.error("Error loading budget data:", error);
      toast({
        title: "Error",
        description: "Failed to load budget data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    if (!user || !newBudget.category || !newBudget.budgetedAmount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          category: newBudget.category,
          budgetedAmount: parseFloat(newBudget.budgetedAmount),
          actualAmount: parseFloat(newBudget.actualAmount) || 0,
          notes: newBudget.notes,
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create budget");
      }

      const data = await response.json();
      setBudgets((prev) => [...prev, data.budget]);
      setNewBudget({
        category: "",
        budgetedAmount: "",
        actualAmount: "",
        notes: "",
      });
      setDialogOpen(false);

      // Refresh analytics
      loadBudgetData();

      toast({
        title: "Budget Created",
        description: `Successfully created budget for ${newBudget.category}`,
      });
    } catch (error) {
      console.error("Error creating budget:", error);
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getBudgetProgress = (budget: Budget) => {
    const actualSpent =
      transactionSummary.find(
        (s) => s.categoryName.toLowerCase() === budget.category.toLowerCase()
      )?.total || budget.actualAmount;

    if (budget.budgetedAmount === 0) return 0;
    return Math.min((actualSpent / budget.budgetedAmount) * 100, 100);
  };

  const getBudgetStatus = (budget: Budget) => {
    const actualSpent =
      transactionSummary.find(
        (s) => s.categoryName.toLowerCase() === budget.category.toLowerCase()
      )?.total || budget.actualAmount;

    if (budget.budgetedAmount === 0) return "no-budget";
    if (actualSpent <= budget.budgetedAmount * 0.8) return "on-track";
    if (actualSpent <= budget.budgetedAmount) return "warning";
    return "over-budget";
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header with gradient */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-400/10 dark:via-indigo-400/10 dark:to-purple-400/10' />
        <div className='relative z-10 flex justify-between items-start'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <TrendingUp className='h-8 w-8 text-indigo-600 dark:text-indigo-400' />
              <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                Budget Dashboard
              </h1>
            </div>
            <p className='text-muted-foreground text-lg mb-4'>
              Track your spending against budget for{" "}
              {new Date(currentYear, parseInt(currentMonth) - 1).toLocaleString(
                "default",
                { month: "long" }
              )}{" "}
              {currentYear} with real-time transaction data.
            </p>
            {analytics && (
              <div className='flex items-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <Target className='h-4 w-4 text-green-600 dark:text-green-400' />
                  <span className='text-muted-foreground'>Budget: </span>
                  <span className='font-semibold text-green-600 dark:text-green-400'>
                    ${analytics.totalBudgeted.toFixed(2)}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-muted-foreground'>Spent: </span>
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>
                    ${analytics.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <AlertCircle
                    className={`h-4 w-4 ${
                      analytics.variance >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  />
                  <span className='text-muted-foreground'>Remaining: </span>
                  <span
                    className={`font-semibold ${
                      analytics.variance >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    ${Math.abs(analytics.variance).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowActualAmounts(!showActualAmounts)}
              className='bg-white/50 dark:bg-gray-800/50'
            >
              {showActualAmounts ? (
                <Eye className='h-4 w-4 mr-2' />
              ) : (
                <EyeOff className='h-4 w-4 mr-2' />
              )}
              {showActualAmounts ? "Hide" : "Show"} Amounts
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Budget Category
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Create New Budget Category</DialogTitle>
                  <DialogDescription>
                    Add a new budget category for{" "}
                    {new Date(
                      currentYear,
                      parseInt(currentMonth) - 1
                    ).toLocaleString("default", { month: "long" })}{" "}
                    {currentYear}
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category Name</Label>
                    <Input
                      id='category'
                      placeholder='e.g., Groceries, Entertainment, Utilities'
                      value={newBudget.category}
                      onChange={(e) =>
                        setNewBudget((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='budgeted'>Budgeted Amount</Label>
                    <Input
                      id='budgeted'
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      value={newBudget.budgetedAmount}
                      onChange={(e) =>
                        setNewBudget((prev) => ({
                          ...prev,
                          budgetedAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='actual'>Actual Spent (Optional)</Label>
                    <Input
                      id='actual'
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      value={newBudget.actualAmount}
                      onChange={(e) =>
                        setNewBudget((prev) => ({
                          ...prev,
                          actualAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='notes'>Notes (Optional)</Label>
                    <Input
                      id='notes'
                      placeholder='Additional notes or descriptions'
                      value={newBudget.notes}
                      onChange={(e) =>
                        setNewBudget((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBudget} disabled={creating}>
                    {creating ? "Creating..." : "Create Budget"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-green-800 dark:text-green-200 text-lg'>
                  Budget Utilization
                </CardTitle>
                <BarChart3 className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2'>
                {analytics.budgetUtilization.toFixed(1)}%
              </div>
              <Progress
                value={Math.min(analytics.budgetUtilization, 100)}
                className='h-2 mb-2'
              />
              <p className='text-sm text-green-700/70 dark:text-green-300/70'>
                {showActualAmounts
                  ? `$${analytics.totalSpent.toFixed(
                      2
                    )} of $${analytics.totalBudgeted.toFixed(2)}`
                  : "Budget tracking active"}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-blue-800 dark:text-blue-200 text-lg'>
                  Categories On Track
                </CardTitle>
                <Target className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
                {analytics.onTrackCategories}
              </div>
              <p className='text-sm text-blue-700/70 dark:text-blue-300/70'>
                Out of {budgets.length} total categories
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/50 dark:border-orange-800/50'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-orange-800 dark:text-orange-200 text-lg'>
                  Over Budget
                </CardTitle>
                <AlertCircle className='h-5 w-5 text-orange-600 dark:text-orange-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400'>
                {analytics.categoriesOverBudget}
              </div>
              <p className='text-sm text-orange-700/70 dark:text-orange-300/70'>
                Categories exceeding budget
              </p>
            </CardContent>
          </Card>

          <Card
            className={`bg-gradient-to-br ${
              analytics.variance >= 0
                ? "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50"
                : "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200/50 dark:border-red-800/50"
            }`}
          >
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle
                  className={`text-lg ${
                    analytics.variance >= 0
                      ? "text-purple-800 dark:text-purple-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {analytics.variance >= 0 ? "Remaining" : "Over Budget"}
                </CardTitle>
                {analytics.variance >= 0 ? (
                  <TrendingUp className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                ) : (
                  <TrendingDown className='h-5 w-5 text-red-600 dark:text-red-400' />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl sm:text-3xl font-bold ${
                  analytics.variance >= 0
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {showActualAmounts
                  ? `$${Math.abs(analytics.variance).toFixed(2)}`
                  : "***"}
              </div>
              <p
                className={`text-sm ${
                  analytics.variance >= 0
                    ? "text-purple-700/70 dark:text-purple-300/70"
                    : "text-red-700/70 dark:text-red-300/70"
                }`}
              >
                {analytics.variancePercentage >= 0
                  ? "Under budget"
                  : "Budget exceeded"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Categories Overview */}
      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Budget Categories Overview
                </CardTitle>
                <CardDescription>
                  Track your spending against budgeted amounts with real-time
                  transaction data
                </CardDescription>
              </div>
              <Button variant='outline' size='sm' onClick={loadBudgetData}>
                Refresh Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {budgets.map((budget) => {
                const actualSpent =
                  transactionSummary.find(
                    (s) =>
                      s.categoryName.toLowerCase() ===
                      budget.category.toLowerCase()
                  )?.total || budget.actualAmount;
                const progress = getBudgetProgress(budget);
                const status = getBudgetStatus(budget);

                return (
                  <div key={budget.id} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <h4 className='font-medium'>{budget.category}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === "on-track"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : status === "warning"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : status === "over-budget"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                          }`}
                        >
                          {status === "on-track"
                            ? "On Track"
                            : status === "warning"
                            ? "Near Limit"
                            : status === "over-budget"
                            ? "Over Budget"
                            : "No Budget"}
                        </span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-medium'>
                          {showActualAmounts
                            ? `$${actualSpent.toFixed(
                                2
                              )} / $${budget.budgetedAmount.toFixed(2)}`
                            : "*** / ***"}
                        </div>
                        {budget.budgetedAmount > 0 && (
                          <div className='text-xs text-muted-foreground'>
                            {progress.toFixed(1)}% used
                          </div>
                        )}
                      </div>
                    </div>
                    {budget.budgetedAmount > 0 && (
                      <Progress
                        value={progress}
                        className={`h-2 ${
                          status === "on-track"
                            ? "[&>div]:bg-green-500"
                            : status === "warning"
                            ? "[&>div]:bg-yellow-500"
                            : "[&>div]:bg-red-500"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spending Breakdown */}
      {transactionSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              This Month's Spending Breakdown
            </CardTitle>
            <CardDescription>
              Based on actual transaction data from your accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {transactionSummary.slice(0, 8).map((summary, index) => (
                <div
                  key={summary.categoryName}
                  className='flex items-center justify-between p-3 rounded-lg bg-muted/50'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-3 h-3 rounded-full bg-${summary.color}-500`}
                    />
                    <div>
                      <p className='font-medium'>{summary.categoryName}</p>
                      <p className='text-xs text-muted-foreground'>
                        {summary.count} transactions
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      {showActualAmounts
                        ? `$${summary.total.toFixed(2)}`
                        : "***"}
                    </p>
                    {analytics && (
                      <p className='text-xs text-muted-foreground'>
                        {((summary.total / analytics.totalSpent) * 100).toFixed(
                          1
                        )}
                        % of total
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Tracker Component */}
      <BudgetTracker />
    </div>
  );
}
