"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  CreditCard,
  TrendingDown,
  Calendar,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";

interface Debt {
  id: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  monthlyPayment: number;
  dueDate: string;
  debtType: string;
  isPaidOff: boolean;
}

const generatePaymentSchedule = (debt: Debt, months = 12) => {
  const schedule = [];
  let currentBalance = debt.currentBalance;
  const currentDate = new Date();

  for (let i = 0; i < months; i++) {
    const paymentDate = new Date(currentDate);
    paymentDate.setMonth(currentDate.getMonth() + i);

    const startingBalance = currentBalance;
    const paymentAmount = Math.min(debt.monthlyPayment, currentBalance);
    const remainingBalance = Math.max(0, currentBalance - paymentAmount);

    schedule.push({
      id: `${debt.id}-${i}`,
      month: paymentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      startingBalance,
      paymentAmount,
      remainingBalance,
      isPaid: i < 2, // Mark first 2 months as paid for demo
      dueDate: paymentDate.toISOString().split("T")[0],
    });

    currentBalance = remainingBalance;
    if (currentBalance === 0) break;
  }

  return schedule;
};

const debtTypeColors: { [key: string]: string } = {
  "Credit Card": "bg-red-500",
  "Student Loan": "bg-blue-500",
  "Personal Loan": "bg-purple-500",
  Mortgage: "bg-green-500",
  "Auto Loan": "bg-orange-500",
  Other: "bg-gray-500",
};

export function DebtTracker() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: "",
    currentBalance: "",
    originalAmount: "",
    interestRate: "",
    minimumPayment: "",
    monthlyPayment: "",
    dueDate: "",
    debtType: "Credit Card",
  });

  useEffect(() => {
    if (user) {
      loadDebts();
    }
  }, [user]);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/debts", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch debts");
      }

      const data = await response.json();
      setDebts(data.debts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load debts");
    } finally {
      setLoading(false);
    }
  };

  const createDebt = async () => {
    if (
      !user ||
      !newDebt.name ||
      !newDebt.currentBalance ||
      !newDebt.monthlyPayment
    ) {
      return;
    }

    try {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          name: newDebt.name,
          originalAmount:
            parseFloat(newDebt.originalAmount) ||
            parseFloat(newDebt.currentBalance),
          currentBalance: parseFloat(newDebt.currentBalance),
          monthlyPayment: parseFloat(newDebt.monthlyPayment),
          interestRate: parseFloat(newDebt.interestRate) || 0,
          minimumPayment:
            parseFloat(newDebt.minimumPayment) ||
            parseFloat(newDebt.monthlyPayment),
          dueDate: newDebt.dueDate || new Date().toISOString().split("T")[0],
          debtType: newDebt.debtType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create debt");
      }

      await loadDebts();
      setNewDebt({
        name: "",
        currentBalance: "",
        originalAmount: "",
        interestRate: "",
        minimumPayment: "",
        monthlyPayment: "",
        dueDate: "",
        debtType: "Credit Card",
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create debt");
    }
  };

  const handleViewScheduleClick = (debt: Debt) => {
    console.log("[v0] View schedule clicked for debt:", debt.name);
    setSelectedDebt(debt);
    setIsScheduleDialogOpen(true);
  };

  // Currency formatting is now handled by the useCurrency hook

  const togglePaymentStatus = (debtId: string, paymentId: string) => {
    console.log(`[v0] Toggle payment ${paymentId} for debt ${debtId}`);
  };

  const getDebtProgress = (debt: Debt) => {
    const totalPaid = debt.originalAmount - debt.currentBalance;
    return (totalPaid / debt.originalAmount) * 100;
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const totalOriginalDebt = debts.reduce(
    (sum, debt) => sum + debt.originalAmount,
    0
  );
  const totalMinimumPayments = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );
  const totalPaid = totalOriginalDebt - totalDebt;

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner />
        <span className='ml-2 text-muted-foreground'>Loading debts...</span>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className='h-6 w-6' />}
        title='No debts tracked yet'
        description='Add your first debt to start tracking your repayment progress.'
        action={{
          label: "Add Debt",
          onClick: () => {
            console.log("[v0] Add Debt clicked from empty state");
            setIsAddDialogOpen(true);
          },
        }}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <CreditCard className='h-5 w-5 text-red-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Total Debt</p>
                <p className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {formatCurrency(totalDebt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <TrendingDown className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Total Paid</p>
                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <DollarSign className='h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm text-muted-foreground'>
                  Monthly Payments
                </p>
                <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {formatCurrency(totalMinimumPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <CheckCircle2 className='h-5 w-5 text-purple-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Progress</p>
                <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {totalOriginalDebt > 0
                    ? Math.round((totalPaid / totalOriginalDebt) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Overview */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>Debt Overview</h2>
          <p className='text-muted-foreground'>
            Track your debt repayment progress
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                console.log("[v0] Add Debt button clicked");
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Debt</DialogTitle>
              <DialogDescription>
                Add a new debt to track your repayment progress.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='debtName'>Debt Name</Label>
                <Input
                  id='debtName'
                  placeholder='e.g., Credit Card - Chase'
                  value={newDebt.name}
                  onChange={(e) =>
                    setNewDebt((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='currentBalance'>Current Balance</Label>
                <Input
                  id='currentBalance'
                  type='number'
                  placeholder='12450'
                  value={newDebt.currentBalance}
                  onChange={(e) =>
                    setNewDebt((prev) => ({
                      ...prev,
                      currentBalance: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='originalAmount'>
                  Original Amount (Optional)
                </Label>
                <Input
                  id='originalAmount'
                  type='number'
                  placeholder='15000'
                  value={newDebt.originalAmount}
                  onChange={(e) =>
                    setNewDebt((prev) => ({
                      ...prev,
                      originalAmount: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='interestRate'>Interest Rate (%)</Label>
                <Input
                  id='interestRate'
                  type='number'
                  step='0.01'
                  placeholder='18.99'
                  value={newDebt.interestRate}
                  onChange={(e) =>
                    setNewDebt((prev) => ({
                      ...prev,
                      interestRate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='monthlyPayment'>Monthly Payment</Label>
                <Input
                  id='monthlyPayment'
                  type='number'
                  placeholder='350'
                  value={newDebt.monthlyPayment}
                  onChange={(e) =>
                    setNewDebt((prev) => ({
                      ...prev,
                      monthlyPayment: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='minimumPayment'>Minimum Payment</Label>
                <Input
                  id='minimumPayment'
                  type='number'
                  placeholder='250'
                  value={newDebt.minimumPayment}
                  onChange={(e) =>
                    setNewDebt((prev) => ({
                      ...prev,
                      minimumPayment: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='debtType'>Debt Type</Label>
                <select
                  id='debtType'
                  className='w-full p-2 border rounded-md'
                  value={newDebt.debtType}
                  onChange={(e) =>
                    setNewDebt((prev) => ({
                      ...prev,
                      debtType: e.target.value,
                    }))
                  }
                >
                  <option value='Credit Card'>Credit Card</option>
                  <option value='Student Loan'>Student Loan</option>
                  <option value='Personal Loan'>Personal Loan</option>
                  <option value='Mortgage'>Mortgage</option>
                  <option value='Auto Loan'>Auto Loan</option>
                  <option value='Other'>Other</option>
                </select>
              </div>
              <Button className='w-full' onClick={createDebt}>
                Add Debt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Debt Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {debts.map((debt) => {
          const debtProgress = getDebtProgress(debt);
          const paymentSchedule = generatePaymentSchedule(debt);
          const paymentProgress =
            (paymentSchedule.filter((p) => p.isPaid).length /
              paymentSchedule.length) *
            100;

          return (
            <Card key={debt.id} className='relative overflow-hidden'>
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1",
                  debtTypeColors["Credit Card"] || "bg-red-500"
                )}
              />

              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{debt.name}</CardTitle>
                    <Badge variant='secondary' className='mt-1 text-xs'>
                      {debt.debtType}
                    </Badge>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>APR</p>
                    <p className='font-semibold'>{debt.interestRate}%</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Debt Progress */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      Debt Reduction
                    </span>
                    <span className='font-medium'>
                      {Math.round(debtProgress)}%
                    </span>
                  </div>
                  <Progress value={debtProgress} className='h-2' />
                </div>

                {/* Amounts */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Current Balance
                    </span>
                    <span className='font-semibold text-red-600 dark:text-red-400'>
                      {formatCurrency(debt.currentBalance)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Original Amount
                    </span>
                    <span className='font-semibold'>
                      {formatCurrency(debt.originalAmount)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Monthly Payment
                    </span>
                    <span className='font-semibold text-blue-600 dark:text-blue-400'>
                      {formatCurrency(debt.monthlyPayment)}
                    </span>
                  </div>
                </div>

                {/* Payment Progress */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      Payment Progress
                    </span>
                    <span className='font-medium'>
                      {Math.round(paymentProgress)}%
                    </span>
                  </div>
                  <Progress value={paymentProgress} className='h-2' />
                </div>

                {/* View Details Button */}
                <Button
                  variant='outline'
                  className='w-full bg-transparent'
                  onClick={() => handleViewScheduleClick(debt)}
                >
                  <Calendar className='h-4 w-4 mr-2' />
                  View Payment Schedule
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Schedule Dialog */}
      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Payment Schedule: {selectedDebt?.name}</DialogTitle>
            <DialogDescription>
              Track your monthly payments and mark them as completed.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {selectedDebt && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>Paid</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Starting Balance</TableHead>
                    <TableHead>Payment Made</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatePaymentSchedule(selectedDebt).map((payment) => (
                    <TableRow
                      key={payment.id}
                      className={payment.isPaid ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={payment.isPaid}
                          onCheckedChange={() =>
                            togglePaymentStatus(selectedDebt.id, payment.id)
                          }
                        />
                      </TableCell>
                      <TableCell className='font-medium'>
                        {payment.month}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.startingBalance)}
                      </TableCell>
                      <TableCell className='text-red-600 dark:text-red-400'>
                        -{formatCurrency(payment.paymentAmount)}
                      </TableCell>
                      <TableCell className='font-semibold'>
                        {formatCurrency(payment.remainingBalance)}
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Debt Reduction Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Total Progress</span>
              <span className='font-semibold'>
                {totalOriginalDebt > 0
                  ? Math.round((totalPaid / totalOriginalDebt) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                totalOriginalDebt > 0
                  ? (totalPaid / totalOriginalDebt) * 100
                  : 0
              }
              className='h-3'
            />
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Remaining debt:</span>
                <p className='font-semibold text-lg text-red-600 dark:text-red-400'>
                  {formatCurrency(totalDebt)}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Total paid off:</span>
                <p className='font-semibold text-lg text-green-600 dark:text-green-400'>
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
