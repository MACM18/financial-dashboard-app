"use client";

import { useState } from "react";
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
  CreditCard,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface DebtTrackerProps {
  debts: Debt[];
  onUpdateDebt: (debt: Partial<Debt> & { id: string }) => Promise<void>;
  onDeleteDebt: (debtId: string) => Promise<void>;
  onMakePayment: (debtId: string, amount: number) => Promise<void>;
}

export function DebtTracker({
  debts,
  onUpdateDebt,
  onDeleteDebt,
  onMakePayment,
}: DebtTrackerProps) {
  const { toast } = useToast();
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [addingPayment, setAddingPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [editDebt, setEditDebt] = useState<Partial<Debt>>({});

  const handleUpdateDebt = async (debtId: string) => {
    try {
      await onUpdateDebt({ id: debtId, ...editDebt });
      setEditingDebt(null);
      setEditDebt({});
      toast({ title: "Success", description: "Debt updated successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update debt.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm("Are you sure you want to delete this debt?")) return;
    try {
      await onDeleteDebt(debtId);
      toast({ title: "Success", description: "Debt deleted successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete debt.",
        variant: "destructive",
      });
    }
  };

  const handleMakePayment = async (debtId: string) => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }
    try {
      await onMakePayment(debtId, amount);
      setAddingPayment(null);
      setPaymentAmount("");
      toast({ title: "Success", description: "Payment made successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make payment.",
        variant: "destructive",
      });
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
    if (total === 0) return 0;
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

  if (debts.length === 0) {
    return (
      <div className='text-center py-12 border-2 border-dashed rounded-lg'>
        <CreditCard className='mx-auto h-12 w-12 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>No debts tracked yet</h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          Click &quot;Add Debt&quot; to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
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
              className={`h-full flex flex-col ${
                debt.isPaidOff
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                  : isOverdue
                  ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                  : isDueSoon
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30"
                  : ""
              }`}
            >
              <CardHeader className='pb-4'>
                <div className='flex items-start justify-between'>
                  {isEditing ? (
                    <Input
                      value={editDebt.name || ""}
                      onChange={(e) =>
                        setEditDebt({ ...editDebt, name: e.target.value })
                      }
                      className='text-lg font-semibold'
                    />
                  ) : (
                    <CardTitle className='text-lg'>{debt.name}</CardTitle>
                  )}
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    {debt.isPaidOff && (
                      <Badge variant='default' className='bg-green-600'>
                        Paid Off
                      </Badge>
                    )}
                    {isOverdue && <Badge variant='destructive'>Overdue</Badge>}
                    {isDueSoon && (
                      <Badge
                        variant='secondary'
                        className='bg-yellow-500 text-white'
                      >
                        Due Soon
                      </Badge>
                    )}
                    <Badge variant='secondary'>
                      {isEditing ? (
                        <Input
                          value={editDebt.debtType || ""}
                          onChange={(e) =>
                            setEditDebt({
                              ...editDebt,
                              debtType: e.target.value,
                            })
                          }
                          className='w-24 h-6 text-xs'
                        />
                      ) : (
                        debt.debtType
                      )}
                    </Badge>
                  </div>
                </div>
                <CardDescription className='flex items-center text-sm pt-1'>
                  <CreditCard className='w-4 h-4 mr-1' />
                  {isEditing ? (
                    <Input
                      type='number'
                      value={editDebt.currentBalance ?? ""}
                      onChange={(e) =>
                        setEditDebt({
                          ...editDebt,
                          currentBalance: parseFloat(e.target.value),
                        })
                      }
                      className='w-28 h-6 ml-2'
                    />
                  ) : (
                    <span className='font-semibold ml-1'>
                      {formatCurrency(debt.currentBalance)}
                    </span>
                  )}
                  <span className='ml-1'>remaining</span>
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4 flex-grow flex flex-col justify-between'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Progress</span>
                      <span className='font-medium'>
                        {progress.toFixed(1)}% paid
                      </span>
                    </div>
                    <Progress value={progress} className='h-2' />
                    <div className='flex justify-between text-sm text-muted-foreground'>
                      <span>{formatCurrency(debt.currentBalance)}</span>
                      <span>{formatCurrency(debt.totalAmount)}</span>
                    </div>
                  </div>

                  <div className='space-y-2 text-sm border-t pt-4'>
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center text-muted-foreground'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        Minimum payment
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={editDebt.minimumPayment ?? ""}
                            onChange={(e) =>
                              setEditDebt({
                                ...editDebt,
                                minimumPayment: parseFloat(e.target.value),
                              })
                            }
                            className='w-24 h-6 text-xs'
                          />
                        ) : (
                          formatCurrency(debt.minimumPayment)
                        )}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>
                        Interest rate
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='number'
                            value={editDebt.interestRate ?? ""}
                            onChange={(e) =>
                              setEditDebt({
                                ...editDebt,
                                interestRate: parseFloat(e.target.value),
                              })
                            }
                            className='w-20 h-6 text-xs'
                          />
                        ) : (
                          `${debt.interestRate}%`
                        )}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='flex items-center text-muted-foreground'>
                        <Calendar className='w-4 h-4 mr-1' />
                        Due date
                      </span>
                      <span className='font-medium'>
                        {isEditing ? (
                          <Input
                            type='date'
                            value={
                              editDebt.dueDate ||
                              (debt.dueDate ? debt.dueDate.split("T")[0] : "")
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
                        <span className='text-muted-foreground flex items-center'>
                          {(isOverdue || isDueSoon) && (
                            <AlertTriangle className='w-4 h-4 mr-1 text-yellow-600' />
                          )}
                          Days until due
                        </span>
                        <Badge
                          variant={
                            isOverdue
                              ? "destructive"
                              : isDueSoon
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : `${daysUntilDue} days`}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  {addingPayment === debt.id && (
                    <div className='space-y-2 pt-4 border-t'>
                      <Label htmlFor={`payment-${debt.id}`}>
                        Make a Payment
                      </Label>
                      <div className='flex gap-2'>
                        <Input
                          id={`payment-${debt.id}`}
                          type='number'
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder='0.00'
                        />
                        <Button
                          size='sm'
                          onClick={() => handleMakePayment(debt.id)}
                        >
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

                  <div className='flex gap-2 pt-2'>
                    {isEditing ? (
                      <>
                        <Button
                          variant='default'
                          size='sm'
                          onClick={() => handleUpdateDebt(debt.id)}
                          className='flex-1'
                        >
                          <Check className='w-4 h-4 mr-2' /> Save
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
                            setEditDebt({
                              name: debt.name,
                              totalAmount: debt.totalAmount,
                              currentBalance: debt.currentBalance,
                              minimumPayment: debt.minimumPayment,
                              interestRate: debt.interestRate,
                              dueDate: debt.dueDate,
                              debtType: debt.debtType,
                              isPaidOff: debt.isPaidOff,
                            });
                          }}
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        {!debt.isPaidOff && (
                          <Button
                            variant='default'
                            size='sm'
                            className='flex-1'
                            onClick={() => setAddingPayment(debt.id)}
                          >
                            Make Payment
                          </Button>
                        )}
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDeleteDebt(debt.id)}
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
