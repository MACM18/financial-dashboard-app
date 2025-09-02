"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusIcon,
  Target,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { LoadingSpinner } from "./LoadingSpinner";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  category: string;
  targetDate: string | null;
  isCompleted: boolean;
}

export function SavingsGoals() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [addingContribution, setAddingContribution] = useState<string | null>(
    null
  );
  const [contributionAmount, setContributionAmount] = useState("");

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    monthlyContribution: "",
    category: "",
    targetDate: "",
  });

  const [editGoal, setEditGoal] = useState<Partial<SavingsGoal>>({});

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/savings", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch savings goals");
      }

      const data = await response.json();
      setGoals(data.goals || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load savings goals"
      );
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    try {
      const response = await fetch("/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          name: newGoal.name,
          targetAmount: parseFloat(newGoal.targetAmount),
          currentAmount: parseFloat(newGoal.currentAmount) || 0,
          monthlyContribution: parseFloat(newGoal.monthlyContribution),
          category: newGoal.category,
          targetDate: newGoal.targetDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create savings goal");
      }

      await fetchGoals();
      setIsAddingGoal(false);
      setNewGoal({
        name: "",
        targetAmount: "",
        currentAmount: "",
        monthlyContribution: "",
        category: "",
        targetDate: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create savings goal"
      );
    }
  };

  const updateGoal = async (goalId: string) => {
    try {
      const response = await fetch("/api/savings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          id: goalId,
          ...editGoal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update savings goal");
      }

      await fetchGoals();
      setEditingGoal(null);
      setEditGoal({});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update savings goal"
      );
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/savings?id=${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete savings goal");
      }

      await fetchGoals();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete savings goal"
      );
    }
  };

  const addContribution = async (goalId: string) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount =
        goal.currentAmount + parseFloat(contributionAmount);

      const response = await fetch("/api/savings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          ...goal,
          currentAmount: newCurrentAmount,
          isCompleted: newCurrentAmount >= goal.targetAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add contribution");
      }

      await fetchGoals();
      setAddingContribution(null);
      setContributionAmount("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add contribution"
      );
    }
  };

  // Currency formatting is now handled by the useCurrency hook

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No target date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTimeToGoal = (
    targetDate: string | null,
    monthlyContribution: number,
    currentAmount: number,
    targetAmount: number
  ) => {
    if (!targetDate) {
      const remainingAmount = targetAmount - currentAmount;
      const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);
      return { status: "no-date", months: monthsNeeded };
    }

    const target = new Date(targetDate);
    const now = new Date();
    const monthsToTarget = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const remainingAmount = targetAmount - currentAmount;
    const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);

    if (monthsNeeded <= monthsToTarget) {
      return { status: "on-track", months: monthsNeeded };
    } else {
      return { status: "behind", months: monthsNeeded };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600 mb-4'>{error}</p>
        <Button onClick={fetchGoals}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Savings Goals</h2>
          <p className='text-muted-foreground'>
            Track your progress towards financial goals
          </p>
        </div>
        <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='w-4 h-4 mr-2' />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Savings Goal</DialogTitle>
              <DialogDescription>
                Set up a new savings goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, name: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='Emergency Fund'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='category' className='text-right'>
                  Category
                </Label>
                <Input
                  id='category'
                  value={newGoal.category}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, category: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='Emergency, Travel, etc.'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='targetAmount' className='text-right'>
                  Target Amount
                </Label>
                <Input
                  id='targetAmount'
                  type='number'
                  value={newGoal.targetAmount}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetAmount: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='10000'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='currentAmount' className='text-right'>
                  Current Amount
                </Label>
                <Input
                  id='currentAmount'
                  type='number'
                  value={newGoal.currentAmount}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, currentAmount: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='0'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='monthlyContribution' className='text-right'>
                  Monthly Contribution
                </Label>
                <Input
                  id='monthlyContribution'
                  type='number'
                  value={newGoal.monthlyContribution}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      monthlyContribution: e.target.value,
                    })
                  }
                  className='col-span-3'
                  placeholder='500'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='targetDate' className='text-right'>
                  Target Date
                </Label>
                <Input
                  id='targetDate'
                  type='date'
                  value={newGoal.targetDate}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetDate: e.target.value })
                  }
                  className='col-span-3'
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setIsAddingGoal(false)}>
                Cancel
              </Button>
              <Button onClick={createGoal}>Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className='text-center py-12'>
          <Target className='mx-auto h-12 w-12 text-muted-foreground' />
          <h3 className='mt-4 text-lg font-semibold'>No savings goals yet</h3>
          <p className='text-muted-foreground'>
            Start by creating your first savings goal.
          </p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {goals.map((goal) => {
            const progress = calculateProgress(
              goal.currentAmount,
              goal.targetAmount
            );
            const timeToGoal = getTimeToGoal(
              goal.targetDate,
              goal.monthlyContribution,
              goal.currentAmount,
              goal.targetAmount
            );
            const isEditing = editingGoal === goal.id;

            return (
              <Card
                key={goal.id}
                className={`h-full ${
                  goal.isCompleted ? "border-green-500" : ""
                }`}
              >
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    {isEditing ? (
                      <Input
                        value={editGoal.name || goal.name}
                        onChange={(e) =>
                          setEditGoal({ ...editGoal, name: e.target.value })
                        }
                        className='text-lg font-semibold'
                      />
                    ) : (
                      <CardTitle className='text-lg'>{goal.name}</CardTitle>
                    )}
                    <div className='flex items-center gap-2'>
                      {goal.isCompleted && (
                        <Badge variant='default'>Completed</Badge>
                      )}
                      <Badge variant='secondary'>
                        {isEditing ? (
                          <Input
                            value={editGoal.category || goal.category}
                            onChange={(e) =>
                              setEditGoal({
                                ...editGoal,
                                category: e.target.value,
                              })
                            }
                            className='w-20 h-6 text-xs'
                          />
                        ) : (
                          goal.category
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className='flex items-center text-sm'>
                    <Target className='w-4 h-4 mr-1' />
                    {isEditing ? (
                      <Input
                        type='number'
                        value={editGoal.targetAmount || goal.targetAmount}
                        onChange={(e) =>
                          setEditGoal({
                            ...editGoal,
                            targetAmount: parseFloat(e.target.value),
                          })
                        }
                        className='w-24 h-6'
                      />
                    ) : (
                      formatCurrency(goal.targetAmount)
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className='h-2' />
                    <div className='flex justify-between text-sm text-muted-foreground'>
                      <span>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={editGoal.currentAmount || goal.currentAmount}
                            onChange={(e) =>
                              setEditGoal({
                                ...editGoal,
                                currentAmount: parseFloat(e.target.value),
                              })
                            }
                            className='w-20 h-6 text-xs'
                          />
                        ) : (
                          formatCurrency(goal.currentAmount)
                        )}
                      </span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        Monthly contribution
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={
                              editGoal.monthlyContribution ||
                              goal.monthlyContribution
                            }
                            onChange={(e) =>
                              setEditGoal({
                                ...editGoal,
                                monthlyContribution: parseFloat(e.target.value),
                              })
                            }
                            className='w-20 h-6 text-xs'
                          />
                        ) : (
                          formatCurrency(goal.monthlyContribution)
                        )}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Calendar className='w-4 h-4 mr-1' />
                        Target date
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='date'
                            value={
                              editGoal.targetDate ||
                              goal.targetDate?.split("T")[0] ||
                              ""
                            }
                            onChange={(e) =>
                              setEditGoal({
                                ...editGoal,
                                targetDate: e.target.value,
                              })
                            }
                            className='w-32 h-6 text-xs'
                          />
                        ) : (
                          formatDate(goal.targetDate)
                        )}
                      </span>
                    </div>

                    {!goal.isCompleted && (
                      <div className='flex items-center justify-between'>
                        <span>Time to goal</span>
                        <Badge
                          variant={
                            timeToGoal.status === "on-track"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {timeToGoal.months} months
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className='flex gap-2 pt-2'>
                    {isEditing ? (
                      <>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => updateGoal(goal.id)}
                        >
                          <Check className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setEditingGoal(null)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setEditingGoal(goal.id);
                            setEditGoal(goal);
                          }}
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        {!goal.isCompleted && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setAddingContribution(goal.id)}
                          >
                            Add Funds
                          </Button>
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </>
                    )}
                  </div>

                  {addingContribution === goal.id && (
                    <div className='space-y-2 pt-2 border-t'>
                      <Label>Add Contribution Amount</Label>
                      <div className='flex gap-2'>
                        <Input
                          type='number'
                          value={contributionAmount}
                          onChange={(e) =>
                            setContributionAmount(e.target.value)
                          }
                          placeholder='0.00'
                        />
                        <Button
                          size='sm'
                          onClick={() => addContribution(goal.id)}
                        >
                          Add
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setAddingContribution(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
