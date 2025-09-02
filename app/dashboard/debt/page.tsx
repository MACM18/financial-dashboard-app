"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Plus,
  CreditCard,
  TrendingDown,
  Calendar,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Debt {
  id: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  monthlyPayment: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  isActive: boolean;
}

export default function DebtPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: "",
    originalAmount: "",
    currentBalance: "",
    monthlyPayment: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "",
  });

  useEffect(() => {
    if (user) {
      loadDebts();
    }
  }, [user]);

  const loadDebts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/debts", {
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch debts");
      }

      const data = await response.json();
      setDebts(data.debts || []);
    } catch (error) {
      console.error("[v0] Error loading debts:", error);
      toast({
        title: "Error",
        description: "Failed to load debts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          minimumPayment: parseFloat(newDebt.monthlyPayment),
          interestRate: parseFloat(newDebt.interestRate) || 0,
          dueDate: newDebt.dueDate,
          debtType: "General", // Add a default debt type
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
      });
      setDialogOpen(false);

      toast({
        title: "Debt Added",
        description: `Successfully added debt: ${newDebt.name}`,
      });
    } catch (error) {
      console.error("[v0] Error creating debt:", error);
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Calculate totals
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
  const totalMonthlyPayments = debts.reduce(
    (sum, d) => sum + Number(d.monthlyPayment),
    0
  );
  const averageInterestRate =
    debts.length > 0
      ? debts.reduce((sum, d) => sum + Number(d.interestRate), 0) / debts.length
      : 0;

  // Calculate total paid (original - current)
  const totalPaid = debts.reduce(
    (sum, d) => sum + (Number(d.originalAmount) - Number(d.currentBalance)),
    0
  );

  // Find debts due soon (within 7 days)
  const debtsComingSoon = debts.filter((debt) => {
    const dueDate = new Date(debt.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

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
                Debt Tracker
              </h1>
            </div>
            <p className='text-muted-foreground text-lg mb-4'>
              Monitor your debt repayment progress and stay on track to become
              debt-free.
            </p>
            <div className='flex items-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <TrendingDown className='h-4 w-4 text-red-600 dark:text-red-400' />
                <span className='text-muted-foreground'>Total Debt: </span>
                <span className='font-semibold text-red-600 dark:text-red-400'>
                  ${totalDebt.toFixed(2)}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <span className='text-muted-foreground'>Monthly: </span>
                <span className='font-semibold text-blue-600 dark:text-blue-400'>
                  ${totalMonthlyPayments.toFixed(2)}
                </span>
              </div>
              {debtsComingSoon > 0 && (
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
                  <span className='text-muted-foreground'>Due Soon: </span>
                  <span className='font-semibold text-yellow-600 dark:text-yellow-400'>
                    {debtsComingSoon} payment{debtsComingSoon !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

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
                  Track a new debt and set up payment monitoring.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='debt-name'>Debt Name</Label>
                  <Input
                    id='debt-name'
                    placeholder='e.g., Credit Card, Student Loan, Mortgage'
                    value={newDebt.name}
                    onChange={(e) =>
                      setNewDebt((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='original-amount'>Original Amount</Label>
                    <Input
                      id='original-amount'
                      type='number'
                      placeholder='10000.00'
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
                      placeholder='8500.00'
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
                      placeholder='300.00'
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
                    <Label htmlFor='interest-rate'>Interest Rate (%)</Label>
                    <Input
                      id='interest-rate'
                      type='number'
                      placeholder='4.5'
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
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='minimum-payment'>Minimum Payment</Label>
                    <Input
                      id='minimum-payment'
                      type='number'
                      placeholder='200.00'
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
                <Button variant='outline' onClick={() => setDialogOpen(false)}>
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

      {/* Debt Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card className='bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200/50 dark:border-red-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-red-800 dark:text-red-200 text-lg'>
              Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400'>
              ${totalDebt.toFixed(2)}
            </div>
            <p className='text-sm text-red-700/70 dark:text-red-300/70'>
              {debts.length} active debt{debts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-blue-800 dark:text-blue-200 text-lg'>
              Monthly Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
              ${totalMonthlyPayments.toFixed(2)}
            </div>
            <p className='text-sm text-blue-700/70 dark:text-blue-300/70'>
              Total monthly obligation
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-green-800 dark:text-green-200 text-lg'>
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400'>
              ${totalPaid.toFixed(2)}
            </div>
            <p className='text-sm text-green-700/70 dark:text-green-300/70'>
              Amount paid down
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200/50 dark:border-yellow-800/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-yellow-800 dark:text-yellow-200 text-lg'>
              Avg Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400'>
              {averageInterestRate.toFixed(1)}%
            </div>
            <p className='text-sm text-yellow-700/70 dark:text-yellow-300/70'>
              Average interest rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debt Tracker Component */}
      <DebtTracker />
    </div>
  );
}
