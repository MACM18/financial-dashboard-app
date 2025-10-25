"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface AccountBalance {
  date: string;
  [accountName: string]: string | number;
}

interface AccountInfo {
  name: string;
  color: string;
  currentBalance: number;
}

export function AccountBalanceTrend() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [balanceData, setBalanceData] = useState<AccountBalance[]>([]);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBalanceTrend();
    }
  }, [user]);

  const fetchBalanceTrend = async () => {
    try {
      setLoading(true);

      // Get accounts
      const accountsResponse = await fetch("/api/accounts", {
        headers: { Authorization: `Bearer ${user?.id}` },
      });

      if (!accountsResponse.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const accountsData = await accountsResponse.json();
      const userAccounts = accountsData.accounts || [];

      // Get transactions for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const transactionsResponse = await fetch(
        `/api/transactions?startDate=${
          threeMonthsAgo.toISOString().split("T")[0]
        }&limit=1000`,
        {
          headers: { Authorization: `Bearer ${user?.id}` },
        }
      );

      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const transactionsData = await transactionsResponse.json();
      const transactions = transactionsData.transactions || [];

      // Process balance trend
      const { balanceHistory, accountInfo } = processBalanceHistory(
        userAccounts,
        transactions
      );

      setBalanceData(balanceHistory);
      setAccounts(accountInfo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load balance trend"
      );
    } finally {
      setLoading(false);
    }
  };

  const processBalanceHistory = (accounts: any[], transactions: any[]) => {
    // Create account info with colors
    const accountInfo: AccountInfo[] = accounts.map((account, index) => ({
      name: account.name,
      color: getAccountColor(index),
      currentBalance: account.balance,
    }));

    // Get account initial balances by subtracting all transactions
    const accountBalances: { [accountId: string]: number } = {};
    accounts.forEach((account) => {
      const accountTransactions = transactions.filter(
        (t) => t.account.name === account.name
      );
      const totalTransactions = accountTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      accountBalances[account.name] = account.balance - totalTransactions;
    });

    // Sort transactions by date
    const sortedTransactions = transactions.sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime()
    );

    // Generate daily balance points
    const balanceHistory: AccountBalance[] = [];
    const dailyBalances = { ...accountBalances };

    // Start from 3 months ago
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    // Add initial point
    const initialPoint: AccountBalance = {
      date: startDate.toISOString().split("T")[0],
    };
    accounts.forEach((account) => {
      initialPoint[account.name] = dailyBalances[account.name];
    });
    balanceHistory.push(initialPoint);

    // Process transactions day by day
    const processedDates = new Set<string>();

    sortedTransactions.forEach((transaction) => {
      const transactionDate = transaction.transactionDate.split("T")[0];

      if (!processedDates.has(transactionDate)) {
        processedDates.add(transactionDate);

        // Apply all transactions for this date
        const dayTransactions = sortedTransactions.filter(
          (t) => t.transactionDate.split("T")[0] === transactionDate
        );

        dayTransactions.forEach((t) => {
          dailyBalances[t.account.name] += t.amount;
        });

        // Create balance point
        const balancePoint: AccountBalance = {
          date: transactionDate,
        };
        accounts.forEach((account) => {
          balancePoint[account.name] = dailyBalances[account.name];
        });
        balanceHistory.push(balancePoint);
      }
    });

    // Add current date if not already included
    const today = new Date().toISOString().split("T")[0];
    if (!processedDates.has(today)) {
      const currentPoint: AccountBalance = {
        date: today,
      };
      accounts.forEach((account) => {
        currentPoint[account.name] = account.balance;
      });
      balanceHistory.push(currentPoint);
    }

    return { balanceHistory, accountInfo };
  };

  const getAccountColor = (index: number) => {
    const colors = [
      "#8b5cf6", // violet
      "#06b6d4", // cyan
      "#f59e0b", // amber
      "#ef4444", // red
      "#10b981", // emerald
      "#f97316", // orange
      "#ec4899", // pink
      "#6366f1", // indigo
      "#84cc16", // lime
      "#14b8a6", // teal
      "#f43f5e", // rose
      "#8b5a2b", // brown
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  };

  const getBalanceChange = () => {
    if (balanceData.length < 2) return 0;

    const firstEntry = balanceData[0];
    const lastEntry = balanceData[balanceData.length - 1];

    const firstTotal = accounts.reduce(
      (sum, account) => sum + ((firstEntry[account.name] as number) || 0),
      0
    );
    const lastTotal = accounts.reduce(
      (sum, account) => sum + ((lastEntry[account.name] as number) || 0),
      0
    );

    return lastTotal - firstTotal;
  };

  if (loading) {
    return (
      <Card className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/50'>
        <CardHeader>
          <CardTitle className='text-emerald-800 dark:text-emerald-200'>
            Account Balance Trend
          </CardTitle>
          <CardDescription>
            Track your account balances over time
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-center h-64'>
          <LoadingSpinner size='sm' />
        </CardContent>
      </Card>
    );
  }

  if (error || balanceData.length === 0) {
    return (
      <Card className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/50'>
        <CardHeader>
          <CardTitle className='text-emerald-800 dark:text-emerald-200'>
            Account Balance Trend
          </CardTitle>
          <CardDescription>
            Track your account balances over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-red-600 text-sm'>
            {error || "No balance data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const balanceChange = getBalanceChange();

  return (
    <Card className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/50'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-emerald-800 dark:text-emerald-200'>
              Account Balance Trend
            </CardTitle>
            <CardDescription>
              Track your account balances over time
            </CardDescription>
          </div>
          <div className='text-right'>
            <div className='flex items-center space-x-2'>
              <Wallet className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              <div>
                <p className='text-sm text-muted-foreground'>Total Balance</p>
                <p className='font-semibold text-emerald-800 dark:text-emerald-200'>
                  {formatCurrency(getTotalBalance())}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center space-x-1 mt-1 ${
                balanceChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {balanceChange >= 0 ? (
                <TrendingUp className='h-4 w-4' />
              ) : (
                <TrendingDown className='h-4 w-4' />
              )}
              <span className='text-xs'>
                {formatCurrency(Math.abs(balanceChange))} (3 months)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='max-h-96 overflow-y-auto'>
        <div className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis
                dataKey='date'
                className='text-xs'
                tick={{ fontSize: 12 }}
                tickFormatter={formatDate}
              />
              <YAxis
                className='text-xs'
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, currency, { compact: true })}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name,
                ]}
                labelFormatter={(label) => `Date: ${formatDate(label)}`}
              />
              <Legend />
              {accounts.map((account) => (
                <Line
                  key={account.name}
                  type='monotone'
                  dataKey={account.name}
                  stroke={account.color}
                  strokeWidth={2}
                  dot={{ fill: account.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Account Legend */}
        <div className='flex flex-wrap gap-3 mt-3 pt-3 border-t border-emerald-200/30 dark:border-emerald-800/30'>
          {accounts.map((account) => (
            <div key={account.name} className='flex items-center space-x-1.5'>
              <div
                className='w-2.5 h-2.5 rounded-full'
                style={{ backgroundColor: account.color }}
              />
              <span className='text-xs'>{account.name}</span>
              <span className='text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                {formatCurrency(account.currentBalance)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
