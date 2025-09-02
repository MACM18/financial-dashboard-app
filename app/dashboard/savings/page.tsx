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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  PiggyBank,
  Clock,
  Award,
  Zap,
  Shield,
  Home,
  Car,
  GraduationCap,
  MapPin,
  Users,
  Eye,
  EyeOff,
  Trophy,
  Star,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Timer,
  Banknote,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";

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

interface SavingsInsight {
  type: "achievement" | "warning" | "suggestion" | "milestone";
  title: string;
  description: string;
  action?: string;
  icon: string;
}

interface GoalCategory {
  name: string;
  icon: any;
  color: string;
  description: string;
}

const GOAL_CATEGORIES: GoalCategory[] = [
  {
    name: "Emergency Fund",
    icon: Shield,
    color: "bg-red-500",
    description: "Financial safety net for unexpected expenses",
  },
  {
    name: "Vacation",
    icon: MapPin,
    color: "bg-blue-500",
    description: "Travel and leisure experiences",
  },
  {
    name: "Home Purchase",
    icon: Home,
    color: "bg-green-500",
    description: "Down payment for your dream home",
  },
  {
    name: "Car Purchase",
    icon: Car,
    color: "bg-purple-500",
    description: "Vehicle purchase or upgrade",
  },
  {
    name: "Retirement",
    icon: Users,
    color: "bg-orange-500",
    description: "Long-term retirement planning",
  },
  {
    name: "Education",
    icon: GraduationCap,
    color: "bg-indigo-500",
    description: "Educational expenses and courses",
  },
  {
    name: "Investment",
    icon: TrendingUp,
    color: "bg-yellow-500",
    description: "Investment opportunities and wealth building",
  },
  {
    name: "General",
    icon: PiggyBank,
    color: "bg-gray-500",
    description: "General savings and miscellaneous goals",
  },
];

const SAVINGS_PRIORITIES = {
  URGENT: { color: "bg-red-500", label: "Urgent", icon: AlertTriangle },
  HIGH: { color: "bg-orange-500", label: "High Priority", icon: Clock },
  MEDIUM: { color: "bg-yellow-500", label: "Medium Priority", icon: Target },
  LOW: { color: "bg-green-500", label: "Low Priority", icon: CheckCircle2 },
};

export default function SavingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPrivacyMode, setShowPrivacyMode] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1M" | "3M" | "6M" | "1Y"
  >("6M");
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
      console.error("Error loading savings goals:", error);
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
      console.error("Error creating savings goal:", error);
      toast({
        title: "Error",
        description: "Failed to create savings goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateGoal = async (
    goal: Partial<SavingsGoal> & { id: string }
  ) => {
    if (!user) return;
    try {
      const response = await fetch("/api/savings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error("Failed to update savings goal");
      }
      await loadSavingsGoals();
    } catch (error) {
      console.error("Error updating savings goal:", error);
      toast({
        title: "Error",
        description: "Failed to update savings goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/savings?id=${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete savings goal");
      }
      await loadSavingsGoals();
    } catch (error) {
      console.error("Error deleting savings goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete savings goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddContribution = async (goalId: string, amount: number) => {
    if (!user) return;
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const newCurrentAmount = goal.currentAmount + amount;
    const isCompleted = newCurrentAmount >= goal.targetAmount;

    await handleUpdateGoal({
      id: goalId,
      currentAmount: newCurrentAmount,
      isCompleted,
    });
  };

  // Enhanced Analytics Calculations
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
  const activeGoals = savingsGoals.filter((g) => !g.isCompleted).length;

  // Advanced Calculations
  const averageProgress =
    savingsGoals.length > 0
      ? savingsGoals.reduce(
          (sum, goal) => sum + (goal.currentAmount / goal.targetAmount) * 100,
          0
        ) / savingsGoals.length
      : 0;

  const remainingAmount = totalTargetAmount - totalCurrentAmount;
  const estimatedCompletionMonths =
    totalMonthlyContribution > 0
      ? Math.ceil(remainingAmount / totalMonthlyContribution)
      : 0;

  // Goal Priority Calculation
  const getGoalPriority = (
    goal: SavingsGoal
  ): keyof typeof SAVINGS_PRIORITIES => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const monthsToTarget = goal.targetDate
      ? Math.ceil(
          (new Date(goal.targetDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        )
      : Infinity;

    if (goal.category === "Emergency Fund" && progress < 50) return "URGENT";
    if (monthsToTarget <= 3 && progress < 80) return "URGENT";
    if (monthsToTarget <= 6 && progress < 60) return "HIGH";
    if (progress < 25) return "HIGH";
    if (progress < 50) return "MEDIUM";
    return "LOW";
  };

  // Generate Savings Insights
  const generateSavingsInsights = (): SavingsInsight[] => {
    const insights: SavingsInsight[] = [];

    // Achievement insights
    const highPerformingGoals = savingsGoals.filter(
      (goal) =>
        goal.currentAmount / goal.targetAmount > 0.8 && !goal.isCompleted
    );

    if (highPerformingGoals.length > 0) {
      insights.push({
        type: "achievement",
        title: "Almost There!",
        description: `You're close to completing ${highPerformingGoals.length} goal(s). Keep it up!`,
        icon: "trophy",
      });
    }

    // Warning insights
    const urgentGoals = savingsGoals.filter(
      (goal) => getGoalPriority(goal) === "URGENT"
    );
    if (urgentGoals.length > 0) {
      insights.push({
        type: "warning",
        title: "Urgent Goals Need Attention",
        description: `${urgentGoals.length} goal(s) require immediate focus to stay on track.`,
        action: "Review goals",
        icon: "alert-triangle",
      });
    }

    // Suggestion insights
    if (totalMonthlyContribution > 0 && completedGoals > 0) {
      insights.push({
        type: "suggestion",
        title: "Consider New Goals",
        description:
          "Great job completing goals! Consider setting new financial targets.",
        action: "Add new goal",
        icon: "star",
      });
    }

    // Milestone insights
    if (overallProgress >= 50 && overallProgress < 75) {
      insights.push({
        type: "milestone",
        title: "Halfway Milestone",
        description:
          "You've reached the halfway point across your savings goals!",
        icon: "award",
      });
    }

    return insights;
  };

  // Goal Distribution Data for Charts
  const goalDistributionData = GOAL_CATEGORIES.map((category) => {
    const categoryGoals = savingsGoals.filter(
      (goal) => goal.category === category.name
    );
    const categoryTotal = categoryGoals.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0
    );
    return {
      name: category.name,
      value: categoryTotal,
      count: categoryGoals.length,
      color: category.color.replace("bg-", "#").replace("-500", ""),
    };
  }).filter((item) => item.value > 0);

  // Progress Trend Data (simulated)
  const progressTrendData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    return {
      month: month.toLocaleDateString("en-US", { month: "short" }),
      saved: totalCurrentAmount * (0.6 + i * 0.08), // Simulated growth
      target: totalTargetAmount,
      progress: Math.min(
        100,
        ((totalCurrentAmount * (0.6 + i * 0.08)) / totalTargetAmount) * 100
      ),
    };
  });

  const insights = generateSavingsInsights();

  // Goal Achievement Forecast
  const goalForecastData = savingsGoals
    .filter((goal) => !goal.isCompleted)
    .map((goal) => {
      const monthsToCompletion =
        goal.monthlyContribution > 0
          ? Math.ceil(
              (goal.targetAmount - goal.currentAmount) /
                goal.monthlyContribution
            )
          : 999;
      return {
        name: goal.name,
        months: Math.min(monthsToCompletion, 60), // Cap at 5 years
        progress: (goal.currentAmount / goal.targetAmount) * 100,
        priority: getGoalPriority(goal),
      };
    })
    .sort((a, b) => a.months - b.months);

  const formatCurrency = (amount: number): string => {
    if (showPrivacyMode) return "••••••";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getInsightIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      "alert-triangle": AlertTriangle,
      star: Star,
      award: Award,
    };
    return icons[iconName] || Target;
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
      {/* Enhanced Header with Analytics */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/50 dark:via-green-950/50 dark:to-teal-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5 dark:from-emerald-400/10 dark:via-green-400/10 dark:to-teal-400/10' />

        <div className='relative z-10'>
          <div className='flex justify-between items-start mb-6'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <PiggyBank className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
                <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                  Savings Goals
                </h1>
              </div>
              <p className='text-muted-foreground text-lg mb-4'>
                Build your financial future with strategic savings planning and
                goal tracking.
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={showPrivacyMode}
                  onCheckedChange={setShowPrivacyMode}
                  id='privacy-mode'
                />
                <Label
                  htmlFor='privacy-mode'
                  className='flex items-center gap-2 text-sm'
                >
                  {showPrivacyMode ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                  Privacy Mode
                </Label>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className='bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Savings Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[425px]'>
                  <DialogHeader>
                    <DialogTitle>Create New Savings Goal</DialogTitle>
                    <DialogDescription>
                      Set a new financial target and start tracking your
                      progress towards financial freedom.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='grid gap-4 py-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='goal-name'>Goal Name *</Label>
                      <Input
                        id='goal-name'
                        placeholder='e.g., Emergency Fund, Dream Vacation, New Car'
                        value={newGoal.name}
                        onChange={(e) =>
                          setNewGoal((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='category'>Category *</Label>
                      <select
                        id='category'
                        className='w-full p-3 border rounded-md text-sm bg-background'
                        value={newGoal.category}
                        onChange={(e) =>
                          setNewGoal((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                      >
                        <option value=''>Choose a category</option>
                        {GOAL_CATEGORIES.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name} - {category.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='target-amount'>Target Amount *</Label>
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
                        <Label htmlFor='current-amount'>Starting Amount</Label>
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
                        <Label htmlFor='target-date'>Target Date</Label>
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
                  </div>
                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setDialogOpen(false)}
                    >
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

          {/* Key Metrics Row */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
                <Wallet className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Total Saved</p>
                <p className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>
                  {formatCurrency(totalCurrentAmount)}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30'>
                <Target className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Target Amount</p>
                <p className='text-xl font-bold text-blue-600 dark:text-blue-400'>
                  {formatCurrency(totalTargetAmount)}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30'>
                <Banknote className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Monthly Saving</p>
                <p className='text-xl font-bold text-purple-600 dark:text-purple-400'>
                  {formatCurrency(totalMonthlyContribution)}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30'>
                <Timer className='h-5 w-5 text-orange-600 dark:text-orange-400' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Est. Completion</p>
                <p className='text-xl font-bold text-orange-600 dark:text-orange-400'>
                  {estimatedCompletionMonths > 0
                    ? `${estimatedCompletionMonths}mo`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Overall Progress</span>
              <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallProgress} className='h-3' />
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>{formatCurrency(totalCurrentAmount)} saved</span>
              <span>{formatCurrency(totalTargetAmount)} target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card className='bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200/50 dark:border-emerald-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-emerald-800 dark:text-emerald-200 text-lg flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5' />
              Goals Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1'>
              {completedGoals}/{savingsGoals.length}
            </div>
            <p className='text-sm text-emerald-700/70 dark:text-emerald-300/70 mb-2'>
              Goals completed
            </p>
            <div className='flex gap-1'>
              <Badge variant='secondary' className='text-xs'>
                {activeGoals} Active
              </Badge>
              {completedGoals > 0 && (
                <Badge variant='default' className='text-xs bg-emerald-500'>
                  {completedGoals} Done
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-blue-800 dark:text-blue-200 text-lg flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1'>
              {averageProgress.toFixed(1)}%
            </div>
            <p className='text-sm text-blue-700/70 dark:text-blue-300/70 mb-2'>
              Across all goals
            </p>
            <Progress value={averageProgress} className='h-2' />
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-purple-800 dark:text-purple-200 text-lg flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Remaining Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1'>
              {formatCurrency(remainingAmount)}
            </div>
            <p className='text-sm text-purple-700/70 dark:text-purple-300/70 mb-2'>
              Left to save
            </p>
            <div className='flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400'>
              <TrendingDown className='h-3 w-3' />
              {((remainingAmount / totalTargetAmount) * 100).toFixed(1)}%
              remaining
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/50 dark:border-orange-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-orange-800 dark:text-orange-200 text-lg flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              Monthly Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1'>
              {formatCurrency(totalMonthlyContribution)}
            </div>
            <p className='text-sm text-orange-700/70 dark:text-orange-300/70 mb-2'>
              Total monthly rate
            </p>
            <div className='text-xs text-orange-600 dark:text-orange-400'>
              {totalMonthlyContribution > 0
                ? `${(
                    (totalMonthlyContribution / totalTargetAmount) *
                    100
                  ).toFixed(2)}% of target`
                : "Set contributions"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {savingsGoals.length > 0 && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Progress Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Savings Progress Trend
              </CardTitle>
              <CardDescription>
                Your savings growth over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={250}>
                <AreaChart data={progressTrendData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis dataKey='month' className='text-xs' />
                  <YAxis className='text-xs' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any, name: string) => [
                      showPrivacyMode ? "••••••" : `$${value.toFixed(2)}`,
                      name === "saved" ? "Amount Saved" : "Target Amount",
                    ]}
                  />
                  <Area
                    type='monotone'
                    dataKey='saved'
                    stroke='#10b981'
                    fill='#10b981'
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Goal Achievement Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                Goal Achievement Forecast
              </CardTitle>
              <CardDescription>
                Estimated completion timeline for active goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {goalForecastData.slice(0, 5).map((goal, index) => {
                  const priorityInfo = SAVINGS_PRIORITIES[goal.priority];
                  const Icon = priorityInfo.icon;
                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 rounded-lg bg-muted/50'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-2 h-2 rounded-full ${priorityInfo.color}`}
                        />
                        <div>
                          <p className='font-medium text-sm'>{goal.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {goal.progress.toFixed(1)}% complete
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Icon className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm font-medium'>
                          {goal.months > 60
                            ? "5+ years"
                            : `${goal.months} months`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {goalForecastData.length === 0 && (
                  <p className='text-center text-muted-foreground py-4'>
                    No active goals to forecast
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5' />
              Savings Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your savings patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              {insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.icon);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === "achievement"
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                        : insight.type === "warning"
                        ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                        : insight.type === "suggestion"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      <Icon
                        className={`h-5 w-5 mt-0.5 ${
                          insight.type === "achievement"
                            ? "text-green-600"
                            : insight.type === "warning"
                            ? "text-red-600"
                            : insight.type === "suggestion"
                            ? "text-blue-600"
                            : "text-purple-600"
                        }`}
                      />
                      <div className='flex-1'>
                        <h4 className='font-semibold text-sm mb-1'>
                          {insight.title}
                        </h4>
                        <p className='text-xs text-muted-foreground mb-2'>
                          {insight.description}
                        </p>
                        {insight.action && (
                          <Button
                            size='sm'
                            variant='outline'
                            className='text-xs'
                          >
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Distribution (if multiple categories) */}
      {goalDistributionData.length > 1 && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <PieChart className='h-5 w-5' />
                Savings by Category
              </CardTitle>
              <CardDescription>
                Distribution of your savings across different goal categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={goalDistributionData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {goalDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      showPrivacyMode ? "••••••" : `$${value.toFixed(2)}`,
                      "Amount",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart className='h-5 w-5' />
                Category Breakdown
              </CardTitle>
              <CardDescription>
                Detailed view of goals and amounts by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {goalDistributionData.map((category, index) => {
                  const categoryInfo = GOAL_CATEGORIES.find(
                    (c) => c.name === category.name
                  );
                  const Icon = categoryInfo?.icon || PiggyBank;
                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 rounded-lg bg-muted/50'
                    >
                      <div className='flex items-center gap-3'>
                        <Icon className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='font-medium text-sm'>{category.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {category.count} goal
                            {category.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-sm'>
                          {formatCurrency(category.value)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {(
                            (category.value / totalCurrentAmount) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Savings Goals Component */}
      <SavingsGoals
        goals={savingsGoals}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onAddContribution={handleAddContribution}
      />
    </div>
  );
}
