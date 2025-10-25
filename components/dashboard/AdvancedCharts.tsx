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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Activity, BarChart3, Zap } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface MonthlyPattern {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  investments: number;
  entertainment: number;
  food: number;
}

interface TransactionPattern {
  day: number;
  frequency: number;
  avgAmount: number;
}

export function AdvancedCharts() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [monthlyPatterns, setMonthlyPatterns] = useState<MonthlyPattern[]>([]);
  const [categoryTreemap, setCategoryTreemap] = useState<CategoryData[]>([]);
  const [transactionPatterns, setTransactionPatterns] = useState<
    TransactionPattern[]
  >([]);

  useEffect(() => {
    if (user) {
      fetchAdvancedAnalytics();
    }
  }, [user]);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);

      // Get transactions for analysis
      const response = await fetch("/api/transactions?limit=1000", {
        headers: { Authorization: `Bearer ${user?.id}` },
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const transactions = data.transactions || [];

      processAdvancedAnalytics(transactions);
    } catch (err) {
      console.error("Error fetching advanced analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const processAdvancedAnalytics = (transactions: any[]) => {
    // Monthly patterns for radar chart
    const monthlyData: { [key: string]: MonthlyPattern } = {};

    // Category data for treemap
    const categoryData: { [key: string]: number } = {};

    // Transaction patterns by day of month
    const dayPatterns: { [key: number]: { total: number; count: number } } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });
      const day = date.getDate();

      // Initialize monthly data
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          savings: 0,
          investments: 0,
          entertainment: 0,
          food: 0,
        };
      }

      // Process by category
      const categoryName = transaction.category.name.toLowerCase();
      const amount = Math.abs(transaction.amount);

      if (transaction.amount > 0) {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += amount;

        // Categorize expenses
        if (
          categoryName.includes("food") ||
          categoryName.includes("restaurant") ||
          categoryName.includes("grocery")
        ) {
          monthlyData[monthKey].food += amount;
        } else if (
          categoryName.includes("entertainment") ||
          categoryName.includes("movie") ||
          categoryName.includes("game")
        ) {
          monthlyData[monthKey].entertainment += amount;
        } else if (
          categoryName.includes("investment") ||
          categoryName.includes("stock")
        ) {
          monthlyData[monthKey].investments += amount;
        } else if (
          categoryName.includes("savings") ||
          categoryName.includes("emergency")
        ) {
          monthlyData[monthKey].savings += amount;
        }
      }

      // Category aggregation for treemap
      if (!categoryData[transaction.category.name]) {
        categoryData[transaction.category.name] = 0;
      }
      categoryData[transaction.category.name] += amount;

      // Day patterns
      if (!dayPatterns[day]) {
        dayPatterns[day] = { total: 0, count: 0 };
      }
      dayPatterns[day].total += amount;
      dayPatterns[day].count += 1;
    });

    // Convert to arrays
    setMonthlyPatterns(Object.values(monthlyData));

    setCategoryTreemap(
      Object.entries(categoryData)
        .map(([name, value], index) => ({
          name,
          value,
          color: getColorForIndex(index),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12)
    );

    setTransactionPatterns(
      Object.entries(dayPatterns)
        .map(([day, data]) => ({
          day: parseInt(day),
          frequency: data.count,
          avgAmount: data.total / data.count,
        }))
        .sort((a, b) => a.day - b.day)
    );
  };

  const getColorForIndex = (index: number) => {
    const colors = [
      "#8b5cf6",
      "#06b6d4",
      "#f59e0b",
      "#ef4444",
      "#10b981",
      "#f97316",
      "#ec4899",
      "#6366f1",
      "#84cc16",
      "#14b8a6",
      "#f43f5e",
      "#8b5a2b",
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className='bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30'
          >
            <CardContent className='flex items-center justify-center h-64'>
              <LoadingSpinner size='sm' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Spending Radar Chart */}
        <Card className='bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50 dark:border-violet-800/50'>
          <CardHeader>
            <CardTitle className='text-violet-800 dark:text-violet-200 flex items-center'>
              <Activity className='h-5 w-5 mr-2' />
              Spending Patterns
            </CardTitle>
            <CardDescription>
              Monthly breakdown across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <RadarChart data={monthlyPatterns}>
                  <PolarGrid stroke='#e5e7eb' />
                  <PolarAngleAxis
                    dataKey='month'
                    tick={{ fontSize: 12 }}
                    className='fill-violet-700 dark:fill-violet-300'
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, "dataMax"]}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => formatCurrency(value, currency, { compact: true })}
                  />
                  <Radar
                    name='Food'
                    dataKey='food'
                    stroke='#f59e0b'
                    fill='#f59e0b'
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name='Entertainment'
                    dataKey='entertainment'
                    stroke='#ec4899'
                    fill='#ec4899'
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name='Savings'
                    dataKey='savings'
                    stroke='#10b981'
                    fill='#10b981'
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Bar Chart */}
        <Card className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/50'>
          <CardHeader>
            <CardTitle className='text-emerald-800 dark:text-emerald-200 flex items-center'>
              <BarChart3 className='h-5 w-5 mr-2' />
              Top Expense Categories
            </CardTitle>
            <CardDescription>Your highest spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {categoryTreemap.slice(0, 8).map((category, index) => {
                const maxValue = categoryTreemap[0]?.value || 1;
                const percentage = (category.value / maxValue) * 100;

                return (
                  <div key={index} className='flex items-center space-x-3'>
                    <div
                      className='w-4 h-4 rounded-full border-2 border-white shadow-sm'
                      style={{ backgroundColor: category.color }}
                    />
                    <div className='flex-1'>
                      <div className='flex justify-between items-center mb-1'>
                        <span className='text-sm font-medium'>
                          {category.name}
                        </span>
                        <span className='text-sm font-semibold'>
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                        <div
                          className='h-2 rounded-full transition-all duration-300'
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Frequency Scatter Plot */}
        <Card className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50'>
          <CardHeader>
            <CardTitle className='text-amber-800 dark:text-amber-200 flex items-center'>
              <Zap className='h-5 w-5 mr-2' />
              Transaction Patterns
            </CardTitle>
            <CardDescription>
              Spending frequency throughout the month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <ScatterChart data={transactionPatterns}>
                  <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
                  <XAxis
                    dataKey='day'
                    type='number'
                    domain={[1, 31]}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Day of Month",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    dataKey='frequency'
                    type='number'
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Frequency",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "avgAmount" ? formatCurrency(value) : value,
                      name === "frequency" ? "Transactions" : "Avg Amount",
                    ]}
                    labelFormatter={(day) => `Day ${day}`}
                  />
                  <Scatter
                    dataKey='frequency'
                    fill='#f59e0b'
                    fillOpacity={0.8}
                    stroke='#d97706'
                    strokeWidth={2}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Ranking */}
        <Card className='bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200/50 dark:border-rose-800/50'>
          <CardHeader>
            <CardTitle className='text-rose-800 dark:text-rose-200 flex items-center'>
              <BarChart3 className='h-5 w-5 mr-2' />
              Expense Ranking
            </CardTitle>
            <CardDescription>
              Your top spending categories ranked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {categoryTreemap.slice(0, 6).map((category, index) => {
                const rank = index + 1;
                const percentage =
                  categoryTreemap.length > 0
                    ? (category.value /
                        categoryTreemap.reduce(
                          (sum, cat) => sum + cat.value,
                          0
                        )) *
                      100
                    : 0;

                return (
                  <div key={index} className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      <div
                        className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold'
                        style={{ backgroundColor: category.color }}
                      >
                        {rank}
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex justify-between items-center'>
                        <h4 className='font-medium text-sm'>{category.name}</h4>
                        <span className='text-sm font-semibold text-rose-600 dark:text-rose-400'>
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center mt-1'>
                        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-2'>
                          <div
                            className='h-1.5 rounded-full'
                            style={{
                              width: `${
                                (category.value / categoryTreemap[0].value) *
                                100
                              }%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                        <span className='text-xs text-muted-foreground min-w-fit'>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
