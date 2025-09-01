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
  CreditCard,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  currentBalance: number;
  minimumPayment: number;
  interestRate: number;
  dueDate: string | null;
  debtType: string;
  isPaidOff: boolean;
}

export function DebtTracker() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [addingPayment, setAddingPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [newDebt, setNewDebt] = useState({
    name: "",
    totalAmount: "",
    currentBalance: "",
    minimumPayment: "",
    interestRate: "",
    dueDate: "",
    debtType: "",
  });

  const [editDebt, setEditDebt] = useState<Partial<Debt>>({});

  useEffect(() => {
    if (user) {
      fetchDebts();
    }
  }, [user]);

  const fetchDebts = async () => {
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
    try {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          name: newDebt.name,
          totalAmount: parseFloat(newDebt.totalAmount),
          currentBalance: parseFloat(newDebt.currentBalance),
          minimumPayment: parseFloat(newDebt.minimumPayment),
          interestRate: parseFloat(newDebt.interestRate) || 0,
          dueDate: newDebt.dueDate || null,
          debtType: newDebt.debtType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create debt");
      }

      await fetchDebts();
      setIsAddingDebt(false);
      setNewDebt({
        name: "",
        totalAmount: "",
        currentBalance: "",
        minimumPayment: "",
        interestRate: "",
        dueDate: "",
        debtType: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create debt");
    }
  };

  const updateDebt = async (debtId: string) => {
    try {
      const response = await fetch("/api/debts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          id: debtId,
          ...editDebt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update debt");
      }

      await fetchDebts();
      setEditingDebt(null);
      setEditDebt({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update debt");
    }
  };

  const deleteDebt = async (debtId: string) => {
    try {
      const response = await fetch(`/api/debts?id=${debtId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete debt");
      }

      await fetchDebts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete debt");
    }
  };

  const makePayment = async (debtId: string) => {
    try {
      const debt = debts.find((d) => d.id === debtId);
      if (!debt) return;

      const newCurrentBalance = Math.max(
        0,
        debt.currentBalance - parseFloat(paymentAmount)
      );

      const response = await fetch("/api/debts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          id: debtId,
          name: debt.name,
          totalAmount: debt.totalAmount,
          currentBalance: newCurrentBalance,
          minimumPayment: debt.minimumPayment,
          interestRate: debt.interestRate,
          dueDate: debt.dueDate,
          debtType: debt.debtType,
          isPaidOff: newCurrentBalance === 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to make payment");
      }

      await fetchDebts();
      setAddingPayment(null);
      setPaymentAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to make payment");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (current: number, total: number) => {
    return Math.min(((total - current) / total) * 100, 100);
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const totalMinimumPayments = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );
  const paidOffDebts = debts.filter((debt) => debt.isPaidOff).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600 mb-4'>{error}</p>
        <Button onClick={fetchDebts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Debt Tracker</h2>
          <p className='text-muted-foreground'>
            Monitor and manage your debt payments
          </p>
        </div>
        <Dialog open={isAddingDebt} onOpenChange={setIsAddingDebt}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='w-4 h-4 mr-2' />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Debt</DialogTitle>
              <DialogDescription>
                Add a new debt to track your payments and progress.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  value={newDebt.name}
                  onChange={(e) =>
                    setNewDebt({ ...newDebt, name: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='Credit Card'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='debtType' className='text-right'>
                  Type
                </Label>
                <Input
                  id='debtType'
                  value={newDebt.debtType}
                  onChange={(e) =>
                    setNewDebt({ ...newDebt, debtType: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='Credit Card, Student Loan, etc.'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='totalAmount' className='text-right'>
                  Original Amount
                </Label>
                <Input
                  id='totalAmount'
                  type='number'
                  value={newDebt.totalAmount}
                  onChange={(e) =>
                    setNewDebt({ ...newDebt, totalAmount: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='10000'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='currentBalance' className='text-right'>
                  Current Balance
                </Label>
                <Input
                  id='currentBalance'
                  type='number'
                  value={newDebt.currentBalance}
                  onChange={(e) =>
                    setNewDebt({ ...newDebt, currentBalance: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='8500'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='minimumPayment' className='text-right'>
                  Minimum Payment
                </Label>
                <Input
                  id='minimumPayment'
                  type='number'
                  value={newDebt.minimumPayment}
                  onChange={(e) =>
                    setNewDebt({ ...newDebt, minimumPayment: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='250'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='interestRate' className='text-right'>
                  Interest Rate (%)
                </Label>
                <Input
                  id='interestRate'
                  type='number'
                  value={newDebt.interestRate}
                  onChange={(e) =>
                    setNewDebt({ ...newDebt, interestRate: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='18.5'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='dueDate' className='text-right'>
                  Due Date
                </Label>
                <Input
                  id='dueDate'
                  type='date'
                  value={newDebt.dueDate}
                  onChange={(e) =>
                    setNewDebt({ ...newDebt, dueDate: e.target.value })
                  }
                  className='col-span-3'
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setIsAddingDebt(false)}>
                Cancel
              </Button>
              <Button onClick={createDebt}>Create Debt</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <CreditCard className='h-5 w-5 text-red-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Total Debt</p>
                <p className='text-2xl font-bold text-red-600'>
                  {formatCurrency(totalDebt)}
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
                <p className='text-2xl font-bold text-blue-600'>
                  {formatCurrency(totalMinimumPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <Check className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Paid Off</p>
                <p className='text-2xl font-bold text-green-600'>
                  {paidOffDebts} of {debts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {debts.length === 0 ? (
        <div className='text-center py-12'>
          <CreditCard className='mx-auto h-12 w-12 text-muted-foreground' />
          <h3 className='mt-4 text-lg font-semibold'>No debts tracked yet</h3>
          <p className='text-muted-foreground'>
            Add your first debt to start tracking payments.
          </p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {debts.map((debt) => {
            const progress = calculateProgress(
              debt.currentBalance,
              debt.totalAmount
            );
            const daysUntilDue = getDaysUntilDue(debt.dueDate);
            const isEditing = editingDebt === debt.id;
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isDueSoon =
              daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

            return (
              <Card
                key={debt.id}
                className={`h-full ${
                  debt.isPaidOff
                    ? "border-green-500"
                    : isOverdue
                    ? "border-red-500"
                    : isDueSoon
                    ? "border-yellow-500"
                    : ""
                }`}
              >
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    {isEditing ? (
                      <Input
                        value={editDebt.name || debt.name}
                        onChange={(e) =>
                          setEditDebt({ ...editDebt, name: e.target.value })
                        }
                        className='text-lg font-semibold'
                      />
                    ) : (
                      <CardTitle className='text-lg'>{debt.name}</CardTitle>
                    )}
                    <div className='flex items-center gap-2'>
                      {debt.isPaidOff && (
                        <Badge variant='default'>Paid Off</Badge>
                      )}
                      {isOverdue && (
                        <Badge variant='destructive'>Overdue</Badge>
                      )}
                      {isDueSoon && <Badge variant='secondary'>Due Soon</Badge>}
                      <Badge variant='secondary'>
                        {isEditing ? (
                          <Input
                            value={editDebt.debtType || debt.debtType}
                            onChange={(e) =>
                              setEditDebt({
                                ...editDebt,
                                debtType: e.target.value,
                              })
                            }
                            className='w-20 h-6 text-xs'
                          />
                        ) : (
                          debt.debtType
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className='flex items-center text-sm'>
                    <CreditCard className='w-4 h-4 mr-1' />
                    {isEditing ? (
                      <Input
                        type='number'
                        value={editDebt.currentBalance || debt.currentBalance}
                        onChange={(e) =>
                          setEditDebt({
                            ...editDebt,
                            currentBalance: parseFloat(e.target.value),
                          })
                        }
                        className='w-24 h-6'
                      />
                    ) : (
                      formatCurrency(debt.currentBalance)
                    )}{" "}
                    remaining
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}% paid</span>
                    </div>
                    <Progress value={progress} className='h-2' />
                    <div className='flex justify-between text-sm text-muted-foreground'>
                      <span>{formatCurrency(debt.currentBalance)}</span>
                      <span>{formatCurrency(debt.totalAmount)} original</span>
                    </div>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        Minimum payment
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={
                              editDebt.minimumPayment || debt.minimumPayment
                            }
                            onChange={(e) =>
                              setEditDebt({
                                ...editDebt,
                                minimumPayment: parseFloat(e.target.value),
                              })
                            }
                            className='w-20 h-6 text-xs'
                          />
                        ) : (
                          formatCurrency(debt.minimumPayment)
                        )}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span>Interest rate</span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={editDebt.interestRate || debt.interestRate}
                            onChange={(e) =>
                              setEditDebt({
                                ...editDebt,
                                interestRate: parseFloat(e.target.value),
                              })
                            }
                            className='w-16 h-6 text-xs'
                          />
                        ) : (
                          `${debt.interestRate}%`
                        )}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Calendar className='w-4 h-4 mr-1' />
                        Due date
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='date'
                            value={
                              editDebt.dueDate ||
                              debt.dueDate?.split("T")[0] ||
                              ""
                            }
                            onChange={(e) =>
                              setEditDebt({
                                ...editDebt,
                                dueDate: e.target.value,
                              })
                            }
                            className='w-32 h-6 text-xs'
                          />
                        ) : (
                          formatDate(debt.dueDate)
                        )}
                      </span>
                    </div>

                    {daysUntilDue !== null && !debt.isPaidOff && (
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center'>
                          {(isOverdue || isDueSoon) && (
                            <AlertTriangle className='w-4 h-4 mr-1 text-yellow-500' />
                          )}
                          Days until due
                        </span>
                        <Badge
                          variant={
                            isOverdue
                              ? "destructive"
                              : isDueSoon
                              ? "secondary"
                              : "default"
                          }
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntilDue)} overdue`
                            : `${daysUntilDue} days`}
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
                          onClick={() => updateDebt(debt.id)}
                        >
                          <Check className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setEditingDebt(null)}
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
                            setEditingDebt(debt.id);
                            setEditDebt(debt);
                          }}
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        {!debt.isPaidOff && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setAddingPayment(debt.id)}
                          >
                            Make Payment
                          </Button>
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => deleteDebt(debt.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </>
                    )}
                  </div>

                  {addingPayment === debt.id && (
                    <div className='space-y-2 pt-2 border-t'>
                      <Label>Payment Amount</Label>
                      <div className='flex gap-2'>
                        <Input
                          type='number'
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder='0.00'
                        />
                        <Button size='sm' onClick={() => makePayment(debt.id)}>
                          Pay
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setAddingPayment(null)}
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
