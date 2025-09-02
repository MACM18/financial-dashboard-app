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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import { AddTransactionForm } from "./AddTransactionForm";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Search,
  CalendarDays,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";

interface Account {
  name: string;
  currency: string;
  type: {
    name: string;
    icon: string;
  };
}

interface Category {
  name: string;
  description: string;
  icon: string;
  color: string;
  isIncome: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  transactionDate: string;
  isRecurring: boolean;
  recurringFrequency: string | null;
  tags: string[];
  notes: string;
  account: Account;
  category: Category;
  createdAt: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
}

export function TransactionsOverview() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions(true);
    }
  }, [user]);

  const fetchTransactions = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const offset = (currentPage - 1) * 10;

      const response = await fetch(
        `/api/transactions?limit=10&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${user?.id}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data: TransactionsResponse = await response.json();

      if (reset) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions((prev) => [...prev, ...(data.transactions || [])]);
      }

      setTotalCount(data.totalCount || 0);
      setHasMore(data.hasMore || false);

      if (!reset) {
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(false);
    }
  };

  const formatCurrencyDisplay = (amount: number, accountCurrency?: string) => {
    return formatCurrency(Math.abs(amount), accountCurrency || currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "red":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "orange":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50'>
        <CardHeader>
          <CardTitle className='text-purple-800 dark:text-purple-200'>
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Track your income and expenses across all accounts
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-center h-32'>
          <LoadingSpinner size='sm' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50'>
        <CardHeader>
          <CardTitle className='text-purple-800 dark:text-purple-200'>
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Track your income and expenses across all accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-red-600 text-sm'>{error}</p>
          <Button
            onClick={() => fetchTransactions(true)}
            variant='outline'
            size='sm'
            className='mt-2'
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50'>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <CardTitle className='text-purple-800 dark:text-purple-200'>
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Track your income and expenses across all accounts
            </CardDescription>
          </div>
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='text-purple-700 border-purple-300 hover:bg-purple-50 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-950/50 w-full sm:w-auto'
            >
              <Filter className='h-4 w-4 mr-2' />
              Filter
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              size='sm'
              className='bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Transaction
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='max-h-96 overflow-y-auto'>
        {transactions.length === 0 ? (
          <div className='text-center py-8'>
            <CreditCard className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground'>No transactions found.</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Add your first transaction to start tracking your finances.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              size='sm'
              className='mt-4 bg-purple-600 hover:bg-purple-700 text-white'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Your First Transaction
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Summary - Sticky */}
            <div className='grid grid-cols-2 gap-3 sticky top-0 z-10 bg-purple-50/90 dark:bg-purple-950/30 backdrop-blur-sm p-2 rounded-lg -m-2'>
              <div className='p-2 rounded-lg bg-white/80 dark:bg-gray-800/50 border border-purple-200/30 dark:border-purple-800/30'>
                <div className='flex items-center'>
                  <ArrowUpCircle className='h-4 w-4 text-green-600 mr-2' />
                  <div>
                    <p className='text-xs text-muted-foreground'>Income</p>
                    <p className='text-sm font-semibold text-green-600 dark:text-green-400'>
                      {formatCurrencyDisplay(
                        transactions
                          .filter((t) => t.amount > 0)
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-white/80 dark:bg-gray-800/50 border border-purple-200/30 dark:border-purple-800/30'>
                <div className='flex items-center'>
                  <ArrowDownCircle className='h-4 w-4 text-red-600 mr-2' />
                  <div>
                    <p className='text-xs text-muted-foreground'>Expenses</p>
                    <p className='text-sm font-semibold text-red-600 dark:text-red-400'>
                      {formatCurrencyDisplay(
                        transactions
                          .filter((t) => t.amount < 0)
                          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List - Scrollable */}
            <div className='space-y-2 max-h-64 overflow-y-auto pr-2'>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className='flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-gray-800/30 border border-purple-200/30 dark:border-purple-800/30 hover:bg-white/80 dark:hover:bg-gray-800/50 transition-colors'
                >
                  <div className='flex items-center space-x-3 flex-1 min-w-0'>
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 ${
                        transaction.amount > 0
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <ArrowUpCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
                      ) : (
                        <ArrowDownCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-2 mb-1'>
                        <p className='font-medium truncate text-sm'>
                          {transaction.description}
                        </p>
                        {transaction.isRecurring && (
                          <Badge variant='secondary' className='text-xs'>
                            R
                          </Badge>
                        )}
                      </div>
                      <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                        <Badge
                          variant='outline'
                          className={`text-xs ${getCategoryColor(
                            transaction.category.color
                          )}`}
                        >
                          {transaction.category.name}
                        </Badge>
                        <span>•</span>
                        <span className='truncate'>
                          {transaction.account.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='text-right flex-shrink-0'>
                    <p
                      className={`font-semibold text-sm ${
                        transaction.amount > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : "-"}
                      {formatCurrencyDisplay(
                        transaction.amount,
                        transaction.account.currency
                      )}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {formatTime(transaction.transactionDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className='text-center pt-4'>
                <Button
                  onClick={loadMore}
                  variant='outline'
                  disabled={loadingMore}
                  className='text-purple-700 border-purple-300 hover:bg-purple-50 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-950/50'
                >
                  {loadingMore ? (
                    <>
                      <LoadingSpinner size='sm' className='mr-2' />
                      Loading...
                    </>
                  ) : (
                    `Load More (${totalCount - transactions.length} remaining)`
                  )}
                </Button>
              </div>
            )}

            {!hasMore && transactions.length > 0 && (
              <div className='text-center pt-4'>
                <p className='text-sm text-muted-foreground'>
                  Showing all {totalCount} transactions
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AddTransactionForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onTransactionAdded={() => fetchTransactions(true)}
      />
    </Card>
  );
}
