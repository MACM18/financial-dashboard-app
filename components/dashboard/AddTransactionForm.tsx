"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { ManageTransactionCategories } from "./ManageTransactionCategories";
import {
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  CalendarDays,
  Settings,
} from "lucide-react";

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  accountType: {
    name: string;
    description: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isIncome: boolean;
}

interface AddTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded: () => void;
}

export function AddTransactionForm({
  open,
  onOpenChange,
  onTransactionAdded,
}: AddTransactionFormProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );

  const [formData, setFormData] = useState({
    accountId: "",
    categoryName: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Today's date
    notes: "",
  });

  useEffect(() => {
    if (open && user) {
      fetchData();
    }
  }, [open, user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch accounts and categories in parallel
      const [accountsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/accounts", {
          headers: { Authorization: `Bearer ${user?.id}` },
        }),
        fetch("/api/transactions/categories", {
          headers: { Authorization: `Bearer ${user?.id}` },
        }),
      ]);

      if (!accountsResponse.ok || !categoriesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const accountsData = await accountsResponse.json();
      const categoriesData = await categoriesResponse.json();

      setAccounts(accountsData.accounts || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.accountId ||
      !formData.categoryName ||
      !formData.amount
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Convert amount based on transaction type
      const amount =
        transactionType === "income"
          ? Math.abs(parseFloat(formData.amount))
          : -Math.abs(parseFloat(formData.amount));

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          accountId: parseInt(formData.accountId),
          categoryName: formData.categoryName,
          amount,
          description: formData.description,
          date: formData.date,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transaction");
      }

      // Reset form
      setFormData({
        accountId: "",
        categoryName: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setTransactionType("expense");

      // Close dialog and refresh transactions
      onOpenChange(false);
      onTransactionAdded();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create transaction"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    transactionType === "income" ? cat.isIncome : !cat.isIncome
  );

  const getCategoryColor = (color: string) => {
    switch (color) {
      case "green":
        return "border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-950/50";
      case "red":
        return "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50";
      case "blue":
        return "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50";
      case "purple":
        return "border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-950/50";
      case "yellow":
        return "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50";
      case "orange":
        return "border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/30 dark:hover:bg-orange-950/50";
      default:
        return "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/30 dark:hover:bg-gray-950/50";
    }
  };

  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense transaction.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner size='sm' />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'>
                <p className='text-red-600 dark:text-red-400 text-sm'>
                  {error}
                </p>
              </div>
            )}

            {/* Transaction Type Toggle */}
            <div className='space-y-2'>
              <Label>Transaction Type *</Label>
              <div className='flex space-x-2'>
                <button
                  type='button'
                  onClick={() => {
                    setTransactionType("expense");
                    setFormData({ ...formData, categoryName: "" });
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    transactionType === "expense"
                      ? "ring-2 ring-red-500 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/30"
                  }`}
                >
                  <div className='flex items-center justify-center space-x-2'>
                    <ArrowDownCircle className='h-5 w-5 text-red-600' />
                    <span className='font-medium'>Expense</span>
                  </div>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setTransactionType("income");
                    setFormData({ ...formData, categoryName: "" });
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    transactionType === "income"
                      ? "ring-2 ring-green-500 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/30"
                  }`}
                >
                  <div className='flex items-center justify-center space-x-2'>
                    <ArrowUpCircle className='h-5 w-5 text-green-600' />
                    <span className='font-medium'>Income</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Selection */}
            <div className='space-y-2'>
              <Label htmlFor='accountId' className='flex items-center gap-1'>
                Account
                <span className='text-red-500'>*</span>
                {!formData.accountId && (
                  <span className='text-xs text-red-500 ml-2 animate-pulse'>
                    Required
                  </span>
                )}
              </Label>
              <select
                id='accountId'
                value={formData.accountId}
                onChange={(e) =>
                  setFormData({ ...formData, accountId: e.target.value })
                }
                className={`w-full p-3 rounded-lg border transition-all duration-200 bg-white dark:bg-gray-800 ${
                  !formData.accountId
                    ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20"
                    : "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
                }`}
                required
              >
                <option value=''>Select an account...</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.accountType.description}) -{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: account.currency,
                    }).format(account.balance)}
                  </option>
                ))}
              </select>
              {!formData.accountId && (
                <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                  <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                  Please select an account for this transaction
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='flex items-center gap-1'>
                  Category
                  <span className='text-red-500'>*</span>
                  {!formData.categoryName && (
                    <span className='text-xs text-red-500 ml-2 animate-pulse'>
                      Required
                    </span>
                  )}
                </Label>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowCategoriesManager(true)}
                  className='h-6 w-6 p-0 text-muted-foreground hover:text-foreground'
                  title='Manage Categories'
                >
                  <Settings className='h-3 w-3' />
                </Button>
              </div>
              <div
                className={`grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 rounded-lg border-2 transition-all duration-200 ${
                  !formData.categoryName
                    ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20"
                    : "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
                }`}
              >
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type='button'
                    onClick={() =>
                      setFormData({ ...formData, categoryName: category.name })
                    }
                    className={`p-2 rounded-lg border-2 transition-all text-left ${
                      formData.categoryName === category.name
                        ? `ring-2 ring-purple-500 ${getCategoryColor(
                            category.color
                          )}`
                        : getCategoryColor(category.color)
                    }`}
                  >
                    <div className='flex items-center space-x-2'>
                      <div className='flex-1'>
                        <p className='font-medium text-sm'>{category.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {!formData.categoryName && (
                <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                  <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                  Please select a category for this transaction
                </p>
              )}
            </div>

            {/* Amount */}
            <div className='space-y-2'>
              <Label htmlFor='amount' className='flex items-center gap-1'>
                Amount
                <span className='text-red-500'>*</span>
                {!formData.amount && (
                  <span className='text-xs text-red-500 ml-2 animate-pulse'>
                    Required
                  </span>
                )}
              </Label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'>
                  {selectedAccount?.currency === "USD"
                    ? "$"
                    : selectedAccount?.currency || "$"}
                </span>
                <Input
                  id='amount'
                  type='number'
                  step='0.01'
                  min='0'
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder='0.00'
                  className={`pl-8 transition-all duration-200 ${
                    !formData.amount
                      ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/50 dark:bg-red-950/20"
                      : formData.amount && parseFloat(formData.amount) > 0
                      ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                      : ""
                  }`}
                  required
                />
              </div>
              {!formData.amount && (
                <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                  <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                  Please enter a transaction amount
                </p>
              )}
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label htmlFor='description'>
                Description (Optional)
              </Label>
              <Input
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  transactionType === "income"
                    ? "e.g., Salary payment"
                    : "e.g., Grocery shopping"
                }
                className={`transition-all duration-200 ${
                  formData.description.length > 0
                    ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                    : ""
                }`}
              />
            </div>

            {/* Date */}
            <div className='space-y-2'>
              <Label htmlFor='date'>Date *</Label>
              <Input
                id='date'
                type='date'
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            {/* Notes */}
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Input
                id='notes'
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder='Additional notes...'
              />
            </div>

            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className='transition-all duration-200 hover:scale-105'
              >
                Cancel
              </Button>

              {/* Validation Status */}
              {(!formData.accountId ||
                !formData.categoryName ||
                !formData.amount) && (
                <div className='flex items-center text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md'>
                  <span className='w-1 h-1 bg-red-500 rounded-full mr-2'></span>
                  {!formData.accountId
                    ? "Select account"
                    : !formData.categoryName
                    ? "Select category"
                    : !formData.amount
                    ? "Enter amount"
                    : ""}
                </div>
              )}

              <Button
                type='submit'
                disabled={
                  submitting ||
                  !formData.accountId ||
                  !formData.categoryName ||
                  !formData.amount
                }
                className={`text-white transition-all duration-200 ${
                  submitting ||
                  !formData.accountId ||
                  !formData.categoryName ||
                  !formData.amount
                    ? "bg-gray-400 cursor-not-allowed"
                    : transactionType === "income"
                    ? "bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg"
                    : "bg-red-600 hover:bg-red-700 hover:scale-105 shadow-lg"
                }`}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size='sm' className='mr-2' />
                    Creating...
                  </>
                ) : (
                  `Add ${transactionType === "income" ? "Income" : "Expense"}`
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>

      {/* Categories Management Dialog */}
      <ManageTransactionCategories
        open={showCategoriesManager}
        onOpenChange={(open) => {
          setShowCategoriesManager(open);
          if (!open) {
            // Refresh categories when the management dialog closes
            fetchData();
          }
        }}
      />
    </Dialog>
  );
}
