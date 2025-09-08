"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { DebtTracker } from "@/components/dashboard/DebtTracker";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertTriangle,
  DollarSign,
  Target,
  Clock,
  Calculator,
  PieChart,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  currentBalance: number;
  monthlyPayment: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string | null;
  debtType: string;
  isPaidOff: boolean;
}

interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: string;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface DebtAnalytics {
  totalDebt: number;
  totalOriginalDebt: number;
  totalPaid: number;
  totalMonthlyPayments: number;
  averageInterestRate: number;
  weightedAverageRate: number;
  totalInterestPaid: number;
  projectedPayoffDate: string;
  monthsToPayoff: number;
  totalInterestProjected: number;
  debtToIncomeRatio: number;
  debtsOverdue: number;
  debtsByType: { [key: string]: { count: number; amount: number } };
  paymentHistory: DebtPayment[];
}

const DEBT_TYPES = [
  { value: "Credit Card", label: "Credit Card", color: "bg-red-500" },
  { value: "Student Loan", label: "Student Loan", color: "bg-blue-500" },
  { value: "Personal Loan", label: "Personal Loan", color: "bg-purple-500" },
  { value: "Mortgage", label: "Mortgage", color: "bg-green-500" },
  { value: "Auto Loan", label: "Auto Loan", color: "bg-orange-500" },
  { value: "Business Loan", label: "Business Loan", color: "bg-indigo-500" },
  { value: "Medical Debt", label: "Medical Debt", color: "bg-pink-500" },
  { value: "Other", label: "Other", color: "bg-gray-500" },
];

export default function DebtPage() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  
  // Helper function for currency-aware placeholders
  const formatPlaceholder = (amount: number) => {
    return formatCurrency(amount, currency, { hideSymbol: true });
  };
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [analytics, setAnalytics] = useState<DebtAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(true);
  const [newDebt, setNewDebt] = useState({
    name: "",
    originalAmount: "",
    currentBalance: "",
    monthlyPayment: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "",
    debtType: "Credit Card",
  });

  const loadDebtData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load debts and recent transactions in parallel
      const [debtsResponse, transactionsResponse] = await Promise.all([
        fetch("/api/debts", {
          headers: { Authorization: `Bearer ${user.id}` },
        }),
        fetch("/api/transactions?limit=1000", {
          headers: { Authorization: `Bearer ${user.id}` },
        }),
      ]);

      if (!debtsResponse.ok) throw new Error("Failed to fetch debts");

      const debtsData = await debtsResponse.json();
      const debtsList = debtsData.debts || [];
      setDebts(debtsList);

      // Calculate advanced analytics
      const analytics = calculateDebtAnalytics(debtsList);
      setAnalytics(analytics);
    } catch (error) {
      console.error("Error loading debt data:", error);
      toast({
        title: "Error",
        description: "Failed to load debt data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadDebtData();
    }
  }, [user, loadDebtData]);

  const calculateDebtAnalytics = (debtsList: Debt[]): DebtAnalytics => {
    const totalDebt = debtsList.reduce(
      (sum, d) => sum + Number(d.currentBalance),
      0
    );
    const totalOriginalDebt = debtsList.reduce(
      (sum, d) => sum + Number(d.totalAmount),
      0
    );
    const totalPaid = totalOriginalDebt - totalDebt;
    const totalMonthlyPayments = debtsList.reduce(
      (sum, d) => sum + Number(d.monthlyPayment),
      0
    );

    // Calculate weighted average interest rate
    const weightedAverageRate =
      debtsList.length > 0
        ? debtsList.reduce(
            (sum, d) => sum + Number(d.interestRate) * Number(d.currentBalance),
            0
          ) / totalDebt
        : 0;

    const averageInterestRate =
      debtsList.length > 0
        ? debtsList.reduce((sum, d) => sum + Number(d.interestRate), 0) /
          debtsList.length
        : 0;

    // Calculate projected payoff timeline
    let monthsToPayoff = 0;
    let totalInterestProjected = 0;

    if (totalDebt > 0 && totalMonthlyPayments > 0) {
      // Simplified calculation - actual would need per-debt amortization
      const avgMonthlyRate = weightedAverageRate / 12 / 100;
      if (avgMonthlyRate > 0) {
        monthsToPayoff = Math.ceil(
          -Math.log(1 - (totalDebt * avgMonthlyRate) / totalMonthlyPayments) /
            Math.log(1 + avgMonthlyRate)
        );
        totalInterestProjected =
          totalMonthlyPayments * monthsToPayoff - totalDebt;
      } else {
        monthsToPayoff = Math.ceil(totalDebt / totalMonthlyPayments);
      }
    }

    const projectedPayoffDate = new Date();
    projectedPayoffDate.setMonth(
      projectedPayoffDate.getMonth() + monthsToPayoff
    );

    // Group debts by type
    const debtsByType: { [key: string]: { count: number; amount: number } } =
      {};
    debtsList.forEach((debt) => {
      const type = debt.debtType || "Other";
      if (!debtsByType[type]) {
        debtsByType[type] = { count: 0, amount: 0 };
      }
      debtsByType[type].count++;
      debtsByType[type].amount += debt.currentBalance;
    });

    // Check for overdue debts
    const today = new Date();
    const debtsOverdue = debtsList.filter((debt) => {
      if (!debt.dueDate) return false;
      const dueDate = new Date(debt.dueDate);
      return dueDate < today && !debt.isPaidOff;
    }).length;

    return {
      totalDebt,
      totalOriginalDebt,
      totalPaid,
      totalMonthlyPayments,
      averageInterestRate,
      weightedAverageRate,
      totalInterestPaid: 0, // Would need payment history
      projectedPayoffDate: projectedPayoffDate.toISOString(),
      monthsToPayoff,
      totalInterestProjected,
      debtToIncomeRatio: 0, // Would need income data
      debtsOverdue,
      debtsByType,
      paymentHistory: [], // Would come from payment tracking
    };
  };

  const handleCreateDebt = async () => {
    if (
      !user ||
      !newDebt.name ||
      !newDebt.currentBalance ||
      !newDebt.monthlyPayment
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          name: newDebt.name,
          totalAmount:
            parseFloat(newDebt.originalAmount) ||
            parseFloat(newDebt.currentBalance),
          currentBalance: parseFloat(newDebt.currentBalance),
          minimumPayment:
            parseFloat(newDebt.minimumPayment) ||
            parseFloat(newDebt.monthlyPayment),
          interestRate: parseFloat(newDebt.interestRate) || 0,
          dueDate:
            newDebt.dueDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          debtType: newDebt.debtType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create debt");
      }

      const data = await response.json();
      setDebts((prev) => [...prev, data.debt]);
      setNewDebt({
        name: "",
        originalAmount: "",
        currentBalance: "",
        monthlyPayment: "",
        interestRate: "",
        minimumPayment: "",
        dueDate: "",
        debtType: "Credit Card",
      });
      setDialogOpen(false);

      // Refresh analytics
      loadDebtData();

      toast({
        title: "Debt Added",
        description: `Successfully added debt: ${newDebt.name}`,
      });
    } catch (error) {
      console.error("Error creating debt:", error);
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateDebt = async (debt: Partial<Debt> & { id: string }) => {
    if (!user) return;
    try {
      const response = await fetch("/api/debts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(debt),
      });

      if (!response.ok) {
        throw new Error("Failed to update debt");
      }
      await loadDebtData();
    } catch (error) {
      console.error("Error updating debt:", error);
      toast({
        title: "Error",
        description: "Failed to update debt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/debts?id=${debtId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete debt");
      }
      await loadDebtData();
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast({
        title: "Error",
        description: "Failed to delete debt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMakePayment = async (debtId: string, amount: number) => {
    if (!user) return;
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const newCurrentBalance = Math.max(0, debt.currentBalance - amount);
    const isPaidOff = newCurrentBalance === 0;

    await handleUpdateDebt({
      id: debtId,
      currentBalance: newCurrentBalance,
      isPaidOff,
    });
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
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-yellow-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5 dark:from-red-400/10 dark:via-orange-400/10 dark:to-yellow-400/10' />
        <div className='relative z-10 flex justify-between items-start'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <CreditCard className='h-8 w-8 text-red-600 dark:text-red-400' />
              <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                Debt Management
              </h1>
            </div>
            <p className='text-muted-foreground text-lg mb-4'>
              Track your debt repayment progress with intelligent analytics and
              payoff projections.
            </p>
            {analytics && (
              <div className='flex items-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <TrendingDown className='h-4 w-4 text-red-600 dark:text-red-400' />
                  <span className='text-muted-foreground'>Total Debt: </span>
                  <span className='font-semibold text-red-600 dark:text-red-400'>
                    {showSensitiveData
                      ? formatCurrency(analytics.totalDebt, currency)
                      : "***"}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-muted-foreground'>Monthly: </span>
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>
                    {showSensitiveData
                      ? formatCurrency(analytics.totalMonthlyPayments, currency)
                      : "***"}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Target className='h-4 w-4 text-green-600 dark:text-green-400' />
                  <span className='text-muted-foreground'>Payoff: </span>
                  <span className='font-semibold text-green-600 dark:text-green-400'>
                    {analytics.monthsToPayoff > 12
                      ? `${Math.ceil(analytics.monthsToPayoff / 12)} years`
                      : `${analytics.monthsToPayoff} months`}
                  </span>
                </div>
                {analytics.debtsOverdue > 0 && (
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
                    <span className='text-muted-foreground'>Overdue: </span>
                    <span className='font-semibold text-yellow-600 dark:text-yellow-400'>
                      {analytics.debtsOverdue} debt
                      {analytics.debtsOverdue !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className='bg-white/50 dark:bg-gray-800/50'
            >
              {showSensitiveData ? (
                <Eye className='h-4 w-4 mr-2' />
              ) : (
                <EyeOff className='h-4 w-4 mr-2' />
              )}
              {showSensitiveData ? "Hide" : "Show"} Amounts
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 shadow-lg'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Debt
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Add New Debt</DialogTitle>
                  <DialogDescription>
                    Track a new debt and set up payment monitoring with payoff
                    projections.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='debt-name'>Debt Name *</Label>
                    <Input
                      id='debt-name'
                      placeholder='e.g., Chase Freedom Credit Card'
                      value={newDebt.name}
                      onChange={(e) =>
                        setNewDebt((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='debt-type'>Debt Type *</Label>
                    <select
                      id='debt-type'
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                      value={newDebt.debtType}
                      onChange={(e) =>
                        setNewDebt((prev) => ({
                          ...prev,
                          debtType: e.target.value,
                        }))
                      }
                    >
                      {DEBT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='original-amount'>Original Amount</Label>
                      <Input
                        id='original-amount'
                        type='number'
                        placeholder={formatPlaceholder(10000)}
                        step='0.01'
                        value={newDebt.originalAmount}
                        onChange={(e) =>
                          setNewDebt((prev) => ({
                            ...prev,
                            originalAmount: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='current-balance'>Current Balance *</Label>
                      <Input
                        id='current-balance'
                        type='number'
                        placeholder={formatPlaceholder(8500)}
                        step='0.01'
                        value={newDebt.currentBalance}
                        onChange={(e) =>
                          setNewDebt((prev) => ({
                            ...prev,
                            currentBalance: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='monthly-payment'>Monthly Payment *</Label>
                      <Input
                        id='monthly-payment'
                        type='number'
                        placeholder={formatPlaceholder(300)}
                        step='0.01'
                        value={newDebt.monthlyPayment}
                        onChange={(e) =>
                          setNewDebt((prev) => ({
                            ...prev,
                            monthlyPayment: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='minimum-payment'>Minimum Payment</Label>
                      <Input
                        id='minimum-payment'
                        type='number'
                        placeholder={formatPlaceholder(200)}
                        step='0.01'
                        value={newDebt.minimumPayment}
                        onChange={(e) =>
                          setNewDebt((prev) => ({
                            ...prev,
                            minimumPayment: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='interest-rate'>Interest Rate (%)</Label>
                      <Input
                        id='interest-rate'
                        type='number'
                        placeholder='18.99'
                        step='0.01'
                        value={newDebt.interestRate}
                        onChange={(e) =>
                          setNewDebt((prev) => ({
                            ...prev,
                            interestRate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='due-date'>Next Due Date</Label>
                      <Input
                        id='due-date'
                        type='date'
                        value={newDebt.dueDate}
                        onChange={(e) =>
                          setNewDebt((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
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
                  <Button onClick={handleCreateDebt} disabled={creating}>
                    {creating ? "Adding..." : "Add Debt"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Overview */}
      {analytics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card className='bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200/50 dark:border-red-800/50'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-red-800 dark:text-red-200 text-lg'>
                  Total Debt
                </CardTitle>
                <CreditCard className='h-5 w-5 text-red-600 dark:text-red-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-2'>
                {showSensitiveData
                  ? formatCurrency(analytics.totalDebt, currency)
                  : "***"}
              </div>
              <Progress
                value={
                  analytics.totalOriginalDebt > 0
                    ? (analytics.totalPaid / analytics.totalOriginalDebt) * 100
                    : 0
                }
                className='h-2 mb-2'
              />
              <p className='text-sm text-red-700/70 dark:text-red-300/70'>
                {debts.length} active debt{debts.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-blue-800 dark:text-blue-200 text-lg'>
                  Monthly Payments
                </CardTitle>
                <Calendar className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
                {showSensitiveData
                  ? formatCurrency(analytics.totalMonthlyPayments, currency)
                  : "***"}
              </div>
              <p className='text-sm text-blue-700/70 dark:text-blue-300/70'>
                {analytics.weightedAverageRate.toFixed(1)}% avg interest rate
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-green-800 dark:text-green-200 text-lg'>
                  Progress Made
                </CardTitle>
                <TrendingUp className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400'>
                {analytics.totalOriginalDebt > 0
                  ? (
                      (analytics.totalPaid / analytics.totalOriginalDebt) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <p className='text-sm text-green-700/70 dark:text-green-300/70'>
                {showSensitiveData
                  ? `${formatCurrency(analytics.totalPaid, currency)} paid down`
                  : "Amount paid down"}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-purple-800 dark:text-purple-200 text-lg'>
                  Debt-Free Date
                </CardTitle>
                <Target className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400'>
                {new Date(analytics.projectedPayoffDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    year: "numeric",
                  }
                )}
              </div>
              <p className='text-sm text-purple-700/70 dark:text-purple-300/70'>
                {analytics.monthsToPayoff} months to go
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debt Breakdown by Type */}
      {analytics && Object.keys(analytics.debtsByType).length > 0 && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Debt Breakdown by Type
                </CardTitle>
                <CardDescription>
                  Distribution of your debts across different categories
                </CardDescription>
              </div>
              <Button variant='outline' size='sm' onClick={loadDebtData}>
                Refresh Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Object.entries(analytics.debtsByType).map(([type, data]) => {
                const typeInfo =
                  DEBT_TYPES.find((t) => t.value === type) ||
                  DEBT_TYPES[DEBT_TYPES.length - 1];
                const percentage =
                  analytics.totalDebt > 0
                    ? (data.amount / analytics.totalDebt) * 100
                    : 0;

                return (
                  <div key={type} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-4 h-4 rounded-full ${typeInfo.color}`}
                        />
                        <span className='font-medium'>{type}</span>
                        <Badge variant='secondary' className='text-xs'>
                          {data.count} debt{data.count !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className='text-right'>
                        <div className='font-semibold'>
                          {showSensitiveData
                            ? formatCurrency(data.amount, currency)
                            : "***"}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className={`h-2 [&>div]:${typeInfo.color}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Debt Cards */}
      <DebtTracker
        debts={debts}
        onUpdateDebt={handleUpdateDebt}
        onDeleteDebt={handleDeleteDebt}
        onMakePayment={handleMakePayment}
      />
    </div>
  );
}
