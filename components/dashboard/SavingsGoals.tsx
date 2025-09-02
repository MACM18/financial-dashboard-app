"use client";

import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
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
  Target,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onUpdateGoal: (goal: Partial<SavingsGoal> & { id: string }) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onAddContribution: (goalId: string, amount: number) => Promise<void>;
}

export function SavingsGoals({
  goals,
  onUpdateGoal,
  onDeleteGoal,
  onAddContribution,
}: SavingsGoalsProps) {
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [addingContribution, setAddingContribution] = useState<string | null>(
    null
  );
  const [contributionAmount, setContributionAmount] = useState("");

  const [editGoal, setEditGoal] = useState<Partial<SavingsGoal>>({});

  const handleUpdateGoal = async (goalId: string) => {
    try {
      await onUpdateGoal({ id: goalId, ...editGoal });
      setEditingGoal(null);
      setEditGoal({});
      toast({ title: "Success", description: "Goal updated successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      await onDeleteGoal(goalId);
      toast({ title: "Success", description: "Goal deleted successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal.",
        variant: "destructive",
      });
    }
  };

  const handleAddContribution = async (goalId: string) => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }
    try {
      await onAddContribution(goalId, amount);
      setAddingContribution(null);
      setContributionAmount("");
      toast({
        title: "Success",
        description: "Contribution added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contribution.",
        variant: "destructive",
      });
    }
  };

  const formatCurrencyDisplay = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No target date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getTimeToGoal = (
    targetDate: string | null,
    monthlyContribution: number,
    currentAmount: number,
    targetAmount: number
  ) => {
    const remainingAmount = targetAmount - currentAmount;
    if (remainingAmount <= 0) return { status: "completed", months: 0 };
    if (monthlyContribution <= 0)
      return { status: "stalled", months: Infinity };

    const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);

    if (!targetDate) {
      return { status: "no-date", months: monthsNeeded };
    }

    const target = new Date(targetDate);
    const now = new Date();
    const monthsToTarget = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44) // Average month length
    );

    if (monthsNeeded <= monthsToTarget) {
      return { status: "on-track", months: monthsNeeded };
    } else {
      return { status: "behind", months: monthsNeeded };
    }
  };

  if (goals.length === 0) {
    return (
      <div className='text-center py-12 border-2 border-dashed rounded-lg'>
        <Target className='mx-auto h-12 w-12 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>No savings goals yet</h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          Click "Add Savings Goal" to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
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
              className={`h-full flex flex-col ${
                goal.isCompleted
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                  : ""
              }`}
            >
              <CardHeader className='pb-4'>
                <div className='flex items-start justify-between'>
                  {isEditing ? (
                    <Input
                      value={editGoal.name || ""}
                      onChange={(e) =>
                        setEditGoal({ ...editGoal, name: e.target.value })
                      }
                      className='text-lg font-semibold'
                    />
                  ) : (
                    <CardTitle className='text-lg'>{goal.name}</CardTitle>
                  )}
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    {goal.isCompleted && (
                      <Badge variant='default' className='bg-green-600'>
                        Completed
                      </Badge>
                    )}
                    <Badge variant='secondary'>
                      {isEditing ? (
                        <Input
                          value={editGoal.category || ""}
                          onChange={(e) =>
                            setEditGoal({
                              ...editGoal,
                              category: e.target.value,
                            })
                          }
                          className='w-24 h-6 text-xs'
                        />
                      ) : (
                        goal.category
                      )}
                    </Badge>
                  </div>
                </div>
                <CardDescription className='flex items-center text-sm pt-1'>
                  <Target className='w-4 h-4 mr-1' />
                  Target:
                  {isEditing ? (
                    <Input
                      type='number'
                      value={editGoal.targetAmount ?? ""}
                      onChange={(e) =>
                        setEditGoal({
                          ...editGoal,
                          targetAmount: parseFloat(e.target.value),
                        })
                      }
                      className='w-28 h-6 ml-2'
                    />
                  ) : (
                    <span className='font-semibold ml-1'>
                      {formatCurrencyDisplay(goal.targetAmount)}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4 flex-grow flex flex-col justify-between'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Progress</span>
                      <span className='font-medium'>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progress} className='h-2' />
                    <div className='flex justify-between text-sm text-muted-foreground'>
                      <span>{formatCurrencyDisplay(goal.currentAmount)}</span>
                      <span>{formatCurrencyDisplay(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className='space-y-2 text-sm border-t pt-4'>
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center text-muted-foreground'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        Monthly contribution
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={editGoal.monthlyContribution ?? ""}
                            onChange={(e) =>
                              setEditGoal({
                                ...editGoal,
                                monthlyContribution: parseFloat(e.target.value),
                              })
                            }
                            className='w-24 h-6 text-xs'
                          />
                        ) : (
                          formatCurrencyDisplay(goal.monthlyContribution)
                        )}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='flex items-center text-muted-foreground'>
                        <Calendar className='w-4 h-4 mr-1' />
                        Target date
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='date'
                            value={
                              editGoal.targetDate ||
                              (goal.targetDate
                                ? goal.targetDate.split("T")[0]
                                : "")
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
                        <span className='text-muted-foreground'>
                          Time to goal
                        </span>
                        <Badge
                          variant={
                            timeToGoal.status === "on-track"
                              ? "default"
                              : timeToGoal.status === "behind"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {timeToGoal.months === Infinity
                            ? "N/A"
                            : `${timeToGoal.months} months`}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  {addingContribution === goal.id && (
                    <div className='space-y-2 pt-4 border-t'>
                      <Label htmlFor={`contribution-${goal.id}`}>
                        Add Contribution Amount
                      </Label>
                      <div className='flex gap-2'>
                        <Input
                          id={`contribution-${goal.id}`}
                          type='number'
                          value={contributionAmount}
                          onChange={(e) =>
                            setContributionAmount(e.target.value)
                          }
                          placeholder='0.00'
                        />
                        <Button
                          size='sm'
                          onClick={() => handleAddContribution(goal.id)}
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

                  <div className='flex gap-2 pt-2'>
                    {isEditing ? (
                      <>
                        <Button
                          variant='default'
                          size='sm'
                          onClick={() => handleUpdateGoal(goal.id)}
                          className='flex-1'
                        >
                          <Check className='w-4 h-4 mr-2' /> Save
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
                            setEditGoal({
                              name: goal.name,
                              targetAmount: goal.targetAmount,
                              currentAmount: goal.currentAmount,
                              monthlyContribution: goal.monthlyContribution,
                              category: goal.category,
                              targetDate: goal.targetDate,
                              isCompleted: goal.isCompleted,
                            });
                          }}
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        {!goal.isCompleted && (
                          <Button
                            variant='default'
                            size='sm'
                            className='flex-1'
                            onClick={() => setAddingContribution(goal.id)}
                          >
                            Add Funds
                          </Button>
                        )}
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
