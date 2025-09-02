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
import {
  Plus,
  TrendingUp,
  DollarSign,
  Target,
  AlertCircle,
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

export default function BudgetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
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
      loadBudgets();
    }
  }, [user]);

  const loadBudgets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`,
        {
          headers: {
            Authorization: `Bearer ${user.id}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const data = await response.json();
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error("[v0] Error loading budgets:", error);
      toast({
        title: "Error",
        description: "Failed to load budgets. Please try again.",
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

      toast({
        title: "Budget Created",
        description: `Successfully created budget for ${newBudget.category}`,
      });
    } catch (error) {
      console.error("[v0] Error creating budget:", error);
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Calculate totals
  const totalBudgeted = budgets.reduce(
    (sum, b) => sum + Number(b.budgetedAmount),
    0
  );
  const totalActual = budgets.reduce(
    (sum, b) => sum + Number(b.actualAmount),
    0
  );
  const budgetUtilization =
    totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;
  const remainingBudget = totalBudgeted - totalActual;

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
                Budget Tracker
              </h1>
            </div>
            <p className='text-muted-foreground text-lg mb-4'>
              Manage your monthly budget for{" "}
              {new Date(currentYear, parseInt(currentMonth) - 1).toLocaleString(
                "default",
                { month: "long" }
              )}{" "}
              {currentYear} and track your spending across categories.
            </p>
            <div className='flex items-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <Target className='h-4 w-4 text-green-600 dark:text-green-400' />
                <span className='text-muted-foreground'>Budget: </span>
                <span className='font-semibold text-green-600 dark:text-green-400'>
                  ${totalBudgeted.toFixed(2)}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <span className='text-muted-foreground'>Spent: </span>
                <span className='font-semibold text-blue-600 dark:text-blue-400'>
                  ${totalActual.toFixed(2)}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <AlertCircle
                  className={`h-4 w-4 ${
                    remainingBudget >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
                <span className='text-muted-foreground'>Remaining: </span>
                <span
                  className={`font-semibold ${
                    remainingBudget >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${remainingBudget.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

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
                <Button variant='outline' onClick={() => setDialogOpen(false)}>
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

      {/* Budget Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-green-800 dark:text-green-200 text-lg'>
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400'>
              ${totalBudgeted.toFixed(2)}
            </div>
            <p className='text-sm text-green-700/70 dark:text-green-300/70'>
              Allocated for{" "}
              {new Date(currentYear, parseInt(currentMonth) - 1).toLocaleString(
                "default",
                { month: "long" }
              )}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-blue-800 dark:text-blue-200 text-lg'>
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
              ${totalActual.toFixed(2)}
            </div>
            <p className='text-sm text-blue-700/70 dark:text-blue-300/70'>
              {budgetUtilization.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${
            remainingBudget >= 0
              ? "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50"
              : "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200/50 dark:border-red-800/50"
          }`}
        >
          <CardHeader className='pb-2'>
            <CardTitle
              className={`text-lg ${
                remainingBudget >= 0
                  ? "text-purple-800 dark:text-purple-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {remainingBudget >= 0 ? "Remaining" : "Over Budget"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                remainingBudget >= 0
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${Math.abs(remainingBudget).toFixed(2)}
            </div>
            <p
              className={`text-sm ${
                remainingBudget >= 0
                  ? "text-purple-700/70 dark:text-purple-300/70"
                  : "text-red-700/70 dark:text-red-300/70"
              }`}
            >
              {remainingBudget >= 0
                ? "Available to spend"
                : "Amount over budget"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Tracker Component */}
      <BudgetTracker />
    </div>
  );
}
