"use client";

import { SpendingAnalytics } from "@/components/dashboard/SpendingAnalytics";
import { AccountBalanceTrend } from "@/components/dashboard/AccountBalanceTrend";
import { AdvancedCharts } from "@/components/dashboard/AdvancedCharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Target,
  DollarSign,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { currency } = useCurrency();
  
  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/50 dark:via-purple-950/50 dark:to-fuchsia-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 dark:from-violet-400/10 dark:via-purple-400/10 dark:to-fuchsia-400/10' />
        <div className='relative z-10'>
          <div className='flex items-center gap-3 mb-2'>
            <BarChart3 className='h-8 w-8 text-purple-600 dark:text-purple-400' />
            <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Financial Analytics
            </h1>
          </div>
          <p className='text-muted-foreground text-lg'>
            Deep insights into your financial patterns, trends, and spending
            habits.
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        {/* Balance Trend */}
        <div className='xl:col-span-2'>
          <AccountBalanceTrend />
        </div>

        {/* Spending Analytics */}
        <div className='xl:col-span-2'>
          <SpendingAnalytics />
        </div>
      </div>

      {/* Advanced Charts */}
      <AdvancedCharts />

      {/* Additional Analytics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-blue-800 dark:text-blue-200 flex items-center text-lg'>
              <TrendingUp className='h-5 w-5 mr-2' />
              Monthly Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <p className='text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400'>
                +12.5%
              </p>
              <p className='text-sm text-muted-foreground'>vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-green-800 dark:text-green-200 flex items-center text-lg'>
              <Target className='h-5 w-5 mr-2' />
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <p className='text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400'>
                23.4%
              </p>
              <p className='text-sm text-muted-foreground'>of income saved</p>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50 dark:border-purple-800/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-purple-800 dark:text-purple-200 flex items-center text-lg'>
              <PieChart className='h-5 w-5 mr-2' />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <p className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                Food
              </p>
              <p className='text-sm text-muted-foreground'>32% of expenses</p>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/50 dark:border-orange-800/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-orange-800 dark:text-orange-200 flex items-center text-lg'>
              <Calendar className='h-5 w-5 mr-2' />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <p className='text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400'>
                {formatCurrency(2340, currency)}
              </p>
              <p className='text-sm text-muted-foreground'>total spent</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
