"use client";

import { useState } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { BudgetTracker } from "@/components/dashboard/BudgetTracker";
import { SavingsGoals } from "@/components/dashboard/SavingsGoals";
import { DebtTracker } from "@/components/dashboard/DebtTracker";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AccountsOverview } from "@/components/dashboard/AccountsOverview";
import { TransactionsOverview } from "@/components/dashboard/TransactionsOverview";
import { SpendingAnalytics } from "@/components/dashboard/SpendingAnalytics";
import { AccountBalanceTrend } from "@/components/dashboard/AccountBalanceTrend";
import { ManageAccountTypes } from "@/components/dashboard/ManageAccountTypes";
import { ManageTransactionCategories } from "@/components/dashboard/ManageTransactionCategories";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  CreditCard,
  Sparkles,
  BarChart3,
  Building2,
  Tag,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState("");
  const [showAccountTypesManager, setShowAccountTypesManager] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);

  console.log("[v0] Dashboard page rendering");

  const handleQuickAction = (action: string) => {
    console.log("[v0] Quick action clicked:", action);
    setDebugInfo(
      `Last action: ${action} at ${new Date().toLocaleTimeString()}`
    );

    switch (action) {
      case "budget":
        router.push("/dashboard/budget");
        break;
      case "savings":
        router.push("/dashboard/savings");
        break;
      case "debt":
        router.push("/dashboard/debt");
        break;
      case "analytics":
        router.push("/dashboard/analytics");
        break;
      case "account-types":
        setShowAccountTypesManager(true);
        break;
      case "categories":
        setShowCategoriesManager(true);
        break;
      case "settings":
        router.push("/dashboard/settings");
        break;
      default:
        console.log("[v0] Unknown action:", action);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Welcome Header with Gradient */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 p-6 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-400/10 dark:via-indigo-400/10 dark:to-purple-400/10' />
        <div className='relative z-10'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <Sparkles className='h-6 w-6 text-indigo-600 dark:text-indigo-400' />
                <h1 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
                  Financial Dashboard
                </h1>
              </div>
              <p className='text-muted-foreground'>
                Welcome back! Here&apos;s your financial overview.
              </p>
            </div>
            <Button
              onClick={() => handleQuickAction("analytics")}
              className='bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto'
            >
              <BarChart3 className='h-4 w-4 mr-2' />
              View Analytics
            </Button>
          </div>
          {debugInfo && (
            <p className='text-xs text-blue-600 dark:text-blue-400 mt-2 opacity-75'>
              [Debug] {debugInfo}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Core Financial Overview - Primary Focus */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {/* Accounts Overview - Main Focus */}
        <div className='xl:col-span-2'>
          <AccountsOverview />
        </div>

        {/* Quick Actions - Compact */}
        <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-blue-800 dark:text-blue-200 text-lg'>
              Quick Actions
            </CardTitle>
            <CardDescription className='text-sm'>
              Manage your finances
            </CardDescription>
          </CardHeader>
          <CardContent className='max-h-80 overflow-y-auto'>
            <div className='space-y-2'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start p-3 h-auto bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200'
                onClick={() => handleQuickAction("budget")}
              >
                <TrendingUp className='h-4 w-4 mr-2 text-blue-600 dark:text-blue-400' />
                <div className='text-left'>
                  <p className='font-medium text-sm'>Update Budget</p>
                  <p className='text-xs text-muted-foreground'>
                    Adjust monthly categories
                  </p>
                </div>
              </Button>

              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start p-3 h-auto bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200'
                onClick={() => handleQuickAction("savings")}
              >
                <Target className='h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400' />
                <div className='text-left'>
                  <p className='font-medium text-sm'>Add Savings Goal</p>
                  <p className='text-xs text-muted-foreground'>
                    Set financial targets
                  </p>
                </div>
              </Button>

              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start p-3 h-auto bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200'
                onClick={() => handleQuickAction("debt")}
              >
                <CreditCard className='h-4 w-4 mr-2 text-purple-600 dark:text-purple-400' />
                <div className='text-left'>
                  <p className='font-medium text-sm'>Record Payment</p>
                  <p className='text-xs text-muted-foreground'>
                    Log debt payments
                  </p>
                </div>
              </Button>

              <div className='border-t border-blue-200/30 dark:border-blue-800/30 my-2'></div>

              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start p-3 h-auto bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200'
                onClick={() => handleQuickAction("account-types")}
              >
                <Building2 className='h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400' />
                <div className='text-left'>
                  <p className='font-medium text-sm'>Account Types</p>
                  <p className='text-xs text-muted-foreground'>
                    Manage account types
                  </p>
                </div>
              </Button>

              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start p-3 h-auto bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200'
                onClick={() => handleQuickAction("categories")}
              >
                <Tag className='h-4 w-4 mr-2 text-teal-600 dark:text-teal-400' />
                <div className='text-left'>
                  <p className='font-medium text-sm'>Categories</p>
                  <p className='text-xs text-muted-foreground'>
                    Manage transaction categories
                  </p>
                </div>
              </Button>

              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start p-3 h-auto bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200'
                onClick={() => handleQuickAction("settings")}
              >
                <Settings className='h-4 w-4 mr-2 text-gray-600 dark:text-gray-400' />
                <div className='text-left'>
                  <p className='font-medium text-sm'>Settings</p>
                  <p className='text-xs text-muted-foreground'>
                    Account & app settings
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Transactions - Secondary Focus */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <TransactionsOverview />
        <RecentActivity />
      </div>

      {/* Analytics Preview - Collapsible Section */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <SpendingAnalytics />
        <AccountBalanceTrend />
      </div>

      {/* Extended Features - Collapsible/Secondary */}
      <details className='group'>
        <summary className='flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border border-gray-200/50 dark:border-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-colors'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
            Budget & Goals Management
          </h3>
          <span className='text-sm text-muted-foreground group-open:hidden'>
            Click to expand
          </span>
          <span className='text-sm text-muted-foreground hidden group-open:inline'>
            Click to collapse
          </span>
        </summary>

        <div className='mt-4 space-y-6'>
          {/* Budget Tracker */}
          <BudgetTracker
            budgets={[]} // TODO: Replace with actual budgets data from API or state
            onUpdateBudget={() => {}} // TODO: Implement update logic
            onSaveBudget={() => {}} // TODO: Implement save logic
            onDeleteBudget={() => {}} // TODO: Implement delete logic
            onAddBudgetRow={() => {}} // TODO: Implement add row logic
          />

          {/* Savings and Debt */}
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
            <SavingsGoals
              goals={[]} // TODO: Replace with actual savings goals data from API or state
              onUpdateGoal={async (_goal) => {}} // TODO: Implement update logic
              onDeleteGoal={async (_goalId) => {}} // TODO: Implement delete logic
              onAddContribution={async (_goalId, _amount) => {}} // TODO: Implement add contribution logic
            />
            <DebtTracker
              debts={[]} // TODO: Replace with actual debts data from API or state
              onUpdateDebt={async (_debt) => {}} // TODO: Implement update logic
              onDeleteDebt={async (_debtId: string) => {}} // TODO: Implement delete logic
              onMakePayment={async (_debtId: string, _amount: number) => {}} // TODO: Implement make payment logic
            />
          </div>
        </div>
      </details>

      {/* Management Dialogs */}
      <ManageAccountTypes
        open={showAccountTypesManager}
        onOpenChange={setShowAccountTypesManager}
      />
      <ManageTransactionCategories
        open={showCategoriesManager}
        onOpenChange={setShowCategoriesManager}
      />
    </div>
  );
}
