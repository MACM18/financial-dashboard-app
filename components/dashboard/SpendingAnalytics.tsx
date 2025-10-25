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
  AreaChart,
  Area,
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
  ComposedChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface SpendingData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsData {
  monthlyTrend: SpendingData[];
  categoryBreakdown: CategoryData[];
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
}

export function SpendingAnalytics() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get transactions from the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const response = await fetch(
        `/api/transactions?startDate=${
          sixMonthsAgo.toISOString().split("T")[0]
        }&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${user?.id}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const transactionsData = await response.json();
      const transactions = transactionsData.transactions || [];

      // Process data for analytics
      const analytics = processTransactionsForAnalytics(transactions);
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const processTransactionsForAnalytics = (
    transactions: any[]
  ): AnalyticsData => {
    // Group by month for trend analysis
    const monthlyData: { [key: string]: { income: number; expenses: number } } =
      {};
    const categoryData: { [key: string]: { value: number; color: string } } =
      {};

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (transaction.amount > 0) {
        monthlyData[monthKey].income += transaction.amount;
        totalIncome += transaction.amount;
      } else {
        const expenseAmount = Math.abs(transaction.amount);
        monthlyData[monthKey].expenses += expenseAmount;
        totalExpenses += expenseAmount;

        // Category breakdown (expenses only)
        const categoryName = transaction.category.name;
        if (!categoryData[categoryName]) {
          categoryData[categoryName] = {
            value: 0,
            color: getCategoryColor(transaction.category.color),
          };
        }
        categoryData[categoryName].value += expenseAmount;
      }
    });

    // Convert monthly data to array and sort
    const monthlyTrend = Object.entries(monthlyData)
      .map(([date, data]) => ({
        date: formatMonthYear(date),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Convert category data to array and sort by value
    const enhancedColors = getEnhancedColors();
    const categoryBreakdown = Object.entries(categoryData)
      .map(([name, data], index) => ({
        name,
        value: data.value,
        color: enhancedColors[index % enhancedColors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories

    return {
      monthlyTrend,
      categoryBreakdown,
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
    };
  };

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      red: "#ef4444",
      green: "#22c55e",
      blue: "#3b82f6",
      purple: "#a855f7",
      yellow: "#eab308",
      orange: "#f97316",
      pink: "#ec4899",
      indigo: "#6366f1",
    };
    return colorMap[color] || "#6b7280";
  };

  // Enhanced color palette for better visual distinction
  const getEnhancedColors = () => [
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

  const formatCurrencyDisplay = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  if (loading) {
    return (
      <Card className='bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200/50 dark:border-indigo-800/50'>
        <CardHeader>
          <CardTitle className='text-indigo-800 dark:text-indigo-200'>
            Spending Analytics
          </CardTitle>
          <CardDescription>
            Your financial trends and category breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-center h-64'>
          <LoadingSpinner size='sm' />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className='bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200/50 dark:border-indigo-800/50'>
        <CardHeader>
          <CardTitle className='text-indigo-800 dark:text-indigo-200'>
            Spending Analytics
          </CardTitle>
          <CardDescription>
            Your financial trends and category breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-red-600 text-sm'>{error || "No data available"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200/50 dark:border-indigo-800/50'>
      <CardHeader>
        <CardTitle className='text-indigo-800 dark:text-indigo-200'>
          Spending Analytics
        </CardTitle>
        <CardDescription>
          Your financial trends and category breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className='max-h-96 overflow-y-auto'>
        <div className='space-y-4'>
          {/* Summary Stats */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center p-3 rounded-lg bg-white/60 dark:bg-gray-800/30 border border-indigo-200/30 dark:border-indigo-800/30'>
              <div className='flex items-center justify-center mb-1'>
                <TrendingUp className='h-4 w-4 text-green-600 mr-1' />
                <span className='text-sm text-green-600 dark:text-green-400'>
                  Income
                </span>
              </div>
              <p className='font-semibold text-green-600 dark:text-green-400'>
                {formatCurrencyDisplay(data.totalIncome)}
              </p>
            </div>
            <div className='text-center p-3 rounded-lg bg-white/60 dark:bg-gray-800/30 border border-indigo-200/30 dark:border-indigo-800/30'>
              <div className='flex items-center justify-center mb-1'>
                <TrendingDown className='h-4 w-4 text-red-600 mr-1' />
                <span className='text-sm text-red-600 dark:text-red-400'>
                  Expenses
                </span>
              </div>
              <p className='font-semibold text-red-600 dark:text-red-400'>
                {formatCurrencyDisplay(data.totalExpenses)}
              </p>
            </div>
            <div className='text-center p-3 rounded-lg bg-white/60 dark:bg-gray-800/30 border border-indigo-200/30 dark:border-indigo-800/30'>
              <div className='flex items-center justify-center mb-1'>
                <DollarSign className='h-4 w-4 text-blue-600 mr-1' />
                <span className='text-sm text-blue-600 dark:text-blue-400'>
                  Net Flow
                </span>
              </div>
              <p
                className={`font-semibold ${
                  data.netFlow >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrencyDisplay(data.netFlow)}
              </p>
            </div>
          </div>

          {/* Monthly Trend Chart - Enhanced */}
          {data.monthlyTrend.length > 0 && (
            <div>
              <h4 className='text-sm font-medium mb-3 text-indigo-800 dark:text-indigo-200'>
                Monthly Income vs Expenses
              </h4>
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart data={data.monthlyTrend}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='opacity-30'
                    />
                    <XAxis
                      dataKey='date'
                      className='text-xs'
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className='text-xs'
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrencyDisplay(value)}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrencyDisplay(value),
                        name === "income"
                          ? "Income"
                          : name === "expenses"
                          ? "Expenses"
                          : "Net Flow",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey='income'
                      fill='#10b981'
                      name='Income'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='expenses'
                      fill='#ef4444'
                      name='Expenses'
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type='monotone'
                      dataKey='net'
                      stroke='#8b5cf6'
                      strokeWidth={3}
                      name='Net Flow'
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Net Flow Trend */}
          {data.monthlyTrend.length > 0 && (
            <div>
              <h4 className='text-sm font-medium mb-3 text-indigo-800 dark:text-indigo-200'>
                Net Cash Flow Trend
              </h4>
              <div className='h-40'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={data.monthlyTrend}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='opacity-30'
                    />
                    <XAxis
                      dataKey='date'
                      className='text-xs'
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className='text-xs'
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrencyDisplay(value)}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrencyDisplay(value),
                        "Net Flow",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type='monotone'
                      dataKey='net'
                      stroke='#8b5cf6'
                      fill='url(#netFlowGradient)'
                      fillOpacity={0.6}
                    />
                    <defs>
                      <linearGradient
                        id='netFlowGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#8b5cf6'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='#8b5cf6'
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Enhanced Category Breakdown */}
          {data.categoryBreakdown.length > 0 && (
            <div>
              <h4 className='text-sm font-medium mb-3 text-indigo-800 dark:text-indigo-200'>
                Expense Categories Analysis
              </h4>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* Enhanced Pie Chart */}
                <div className='h-52'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percent }) =>
                          percent > 5
                            ? `${name} ${(percent * 100).toFixed(0)}%`
                            : ""
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        stroke='#ffffff'
                        strokeWidth={2}
                      >
                        {data.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrencyDisplay(value)}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category List */}
                <div className='space-y-2'>
                  {data.categoryBreakdown.map((category, index) => {
                    const percentage =
                      (category.value / data.totalExpenses) * 100;
                    return (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-gray-800/20 border border-indigo-200/20 dark:border-indigo-800/20'
                      >
                        <div className='flex items-center space-x-2'>
                          <div
                            className='w-4 h-4 rounded-full border-2 border-white shadow-sm'
                            style={{ backgroundColor: category.color }}
                          />
                          <span className='text-sm capitalize font-medium'>
                            {category.name}
                          </span>
                        </div>
                        <div className='text-right'>
                          <span className='text-sm font-semibold'>
                            {formatCurrencyDisplay(category.value)}
                          </span>
                          <div className='text-xs text-muted-foreground'>
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Bar Chart */}
              <div className='mt-4'>
                <h5 className='text-xs font-medium mb-2 text-indigo-700 dark:text-indigo-300'>
                  Spending by Category
                </h5>
                <div className='h-32'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={data.categoryBreakdown}
                      layout='horizontal'
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        className='opacity-20'
                      />
                      <XAxis
                        type='number'
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) =>
                          `$${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <YAxis
                        dataKey='name'
                        type='category'
                        tick={{ fontSize: 10 }}
                        width={60}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrencyDisplay(value),
                          "Amount",
                        ]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey='value' radius={[0, 4, 4, 0]}>
                        {data.categoryBreakdown.map((entry, index) => (
                          <Cell key={`bar-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
