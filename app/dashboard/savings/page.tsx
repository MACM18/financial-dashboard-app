"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SavingsGoals } from "@/components/dashboard/SavingsGoals";
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
import { Plus, Target, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  category: string;
  targetDate?: string;
  isCompleted: boolean;
}

export default function SavingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    monthlyContribution: "",
    category: "",
    targetDate: "",
  });

  useEffect(() => {
    if (user) {
      loadSavingsGoals();
    }
  }, [user]);

  const loadSavingsGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/savings", {
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch savings goals");
      }

      const data = await response.json();
      setSavingsGoals(data.goals || []);
    } catch (error) {
      console.error("[v0] Error loading savings goals:", error);
      toast({
        title: "Error",
        description: "Failed to load savings goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!user || !newGoal.name || !newGoal.targetAmount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          name: newGoal.name,
          targetAmount: parseFloat(newGoal.targetAmount),
          currentAmount: parseFloat(newGoal.currentAmount) || 0,
          monthlyContribution: parseFloat(newGoal.monthlyContribution) || 0,
          category: newGoal.category || "General",
          targetDate: newGoal.targetDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create savings goal");
      }

      const data = await response.json();
      setSavingsGoals((prev) => [...prev, data.goal]);
      setNewGoal({
        name: "",
        targetAmount: "",
        currentAmount: "",
        monthlyContribution: "",
        category: "",
        targetDate: "",
      });
      setDialogOpen(false);

      toast({
        title: "Savings Goal Created",
        description: `Successfully created goal: ${newGoal.name}`,
      });
    } catch (error) {
      console.error("[v0] Error creating savings goal:", error);
      toast({
        title: "Error",
        description: "Failed to create savings goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Calculate totals
  const totalTargetAmount = savingsGoals.reduce(
    (sum, g) => sum + Number(g.targetAmount),
    0
  );
  const totalCurrentAmount = savingsGoals.reduce(
    (sum, g) => sum + Number(g.currentAmount),
    0
  );
  const totalMonthlyContribution = savingsGoals.reduce(
    (sum, g) => sum + Number(g.monthlyContribution),
    0
  );
  const overallProgress =
    totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
  const completedGoals = savingsGoals.filter((g) => g.isCompleted).length;

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
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 dark:from-green-400/10 dark:via-emerald-400/10 dark:to-teal-400/10' />
        <div className='relative z-10 flex justify-between items-start'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <Target className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
              <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                Savings Goals
              </h1>
            </div>
            <p className='text-muted-foreground text-lg mb-4'>
              Track your progress towards your financial goals and build a
              better future.
            </p>
            <div className='flex items-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4 text-green-600 dark:text-green-400' />
                <span className='text-muted-foreground'>Progress: </span>
                <span className='font-semibold text-green-600 dark:text-green-400'>
                  {overallProgress.toFixed(1)}%
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <span className='text-muted-foreground'>Saved: </span>
                <span className='font-semibold text-blue-600 dark:text-blue-400'>
                  ${totalCurrentAmount.toFixed(2)}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                <span className='text-muted-foreground'>Monthly: </span>
                <span className='font-semibold text-purple-600 dark:text-purple-400'>
                  ${totalMonthlyContribution.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg'>
                <Plus className='h-4 w-4 mr-2' />
                Add Savings Goal
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Create New Savings Goal</DialogTitle>
                <DialogDescription>
                  Set a new financial target and start tracking your progress.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='goal-name'>Goal Name</Label>
                  <Input
                    id='goal-name'
                    placeholder='e.g., Emergency Fund, Vacation, New Car'
                    value={newGoal.name}
                    onChange={(e) =>
                      setNewGoal((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='target-amount'>Target Amount</Label>
                    <Input
                      id='target-amount'
                      type='number'
                      placeholder='10000.00'
                      step='0.01'
                      value={newGoal.targetAmount}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          targetAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='current-amount'>Current Amount</Label>
                    <Input
                      id='current-amount'
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      value={newGoal.currentAmount}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          currentAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='monthly-contribution'>
                      Monthly Contribution
                    </Label>
                    <Input
                      id='monthly-contribution'
                      type='number'
                      placeholder='500.00'
                      step='0.01'
                      value={newGoal.monthlyContribution}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          monthlyContribution: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category</Label>
                    <select
                      id='category'
                      className='w-full p-2 border rounded-md text-sm'
                      value={newGoal.category}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value=''>Select category</option>
                      <option value='Emergency Fund'>Emergency Fund</option>
                      <option value='Vacation'>Vacation</option>
                      <option value='Home Purchase'>Home Purchase</option>
                      <option value='Car Purchase'>Car Purchase</option>
                      <option value='Retirement'>Retirement</option>
                      <option value='Education'>Education</option>
                      <option value='General'>General</option>
                    </select>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='target-date'>Target Date (Optional)</Label>
                  <Input
                    id='target-date'
                    type='date'
                    value={newGoal.targetDate}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        targetDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal} disabled={creating}>
                  {creating ? "Creating..." : "Create Goal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Savings Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-green-800 dark:text-green-200 text-lg'>
              Total Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400'>
              ${totalCurrentAmount.toFixed(2)}
            </div>
            <p className='text-sm text-green-700/70 dark:text-green-300/70'>
              Across all goals
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-blue-800 dark:text-blue-200 text-lg'>
              Target Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
              ${totalTargetAmount.toFixed(2)}
            </div>
            <p className='text-sm text-blue-700/70 dark:text-blue-300/70'>
              Total goal amount
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-purple-800 dark:text-purple-200 text-lg'>
              Monthly Saving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400'>
              ${totalMonthlyContribution.toFixed(2)}
            </div>
            <p className='text-sm text-purple-700/70 dark:text-purple-300/70'>
              Total contribution
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/50 dark:border-orange-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-orange-800 dark:text-orange-200 text-lg'>
              Goals Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400'>
              {completedGoals}/{savingsGoals.length}
            </div>
            <p className='text-sm text-orange-700/70 dark:text-orange-300/70'>
              Goals completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals Component */}
      <SavingsGoals />
    </div>
  );
}
