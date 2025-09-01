"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  CreditCard,
  Settings,
  ChevronRight,
  PieChart,
  BarChart3,
} from "lucide-react";

interface SidebarStats {
  totalBudget: number;
  totalSavings: number;
  totalDebt: number;
  budgetUtilization: number;
  monthlyChange: number;
  savingsProgress: number;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your finances",
  },
  {
    name: "Budget Tracker",
    href: "/dashboard/budget",
    icon: PieChart,
    description: "Manage monthly budgets",
  },
  {
    name: "Savings Goals",
    href: "/dashboard/savings",
    icon: Target,
    description: "Track savings progress",
  },
  {
    name: "Debt Tracker",
    href: "/dashboard/debt",
    icon: CreditCard,
    description: "Monitor debt repayment",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Financial insights & trends",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account preferences",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [stats, setStats] = useState<SidebarStats | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSidebarStats();
    }
  }, [user]);

  const fetchSidebarStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Parse values from the stats response
        const totalBudget = parseFloat(
          data.stats[0]?.value?.replace(/[$,]/g, "") || "0"
        );
        const totalSavings = parseFloat(
          data.stats[2]?.value?.replace(/[$,]/g, "") || "0"
        );
        const totalDebt = parseFloat(
          data.stats[3]?.value?.replace(/[$,]/g, "") || "0"
        );

        // Calculate monthly change based on spending vs budget
        const totalSpent = parseFloat(
          data.stats[1]?.value?.replace(/[$,]/g, "") || "0"
        );
        const monthlyChange =
          totalBudget > 0
            ? ((totalBudget - totalSpent) / totalBudget) * 100
            : 0;

        setStats({
          totalBudget,
          totalSavings,
          totalDebt,
          budgetUtilization: parseFloat(
            data.stats[1]?.change?.replace(/[%]/g, "") || "0"
          ),
          monthlyChange,
          savingsProgress: 0, // Will calculate if needed
        });
      }
    } catch (error) {
      console.error("Failed to fetch sidebar stats:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "$0";
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-card border-r border-border",
        className
      )}
    >
      <div className='flex h-16 items-center border-b border-border px-6'>
        <div className='flex items-center space-x-2'>
          <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
            <TrendingUp className='h-5 w-5 text-white' />
          </div>
          <div>
            <h1 className='text-lg font-semibold text-foreground'>
              FinanceApp
            </h1>
            <p className='text-xs text-muted-foreground'>Personal Dashboard</p>
          </div>
        </div>
      </div>

      <nav className='flex-1 space-y-1 p-4'>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <div className='flex-1 min-w-0'>
                <p className='truncate'>{item.name}</p>
                <p
                  className={cn(
                    "truncate text-xs transition-colors",
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground/70 group-hover:text-muted-foreground"
                  )}
                >
                  {item.description}
                </p>
              </div>
              {isActive && (
                <ChevronRight className='h-4 w-4 text-primary-foreground' />
              )}
            </Link>
          );
        })}
      </nav>

      <div className='border-t border-border p-4'>
        <div className='text-xs text-muted-foreground'>
          <p className='mb-1'>Financial Overview</p>
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span>This Month</span>
              <span
                className={`${
                  stats && stats.monthlyChange >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stats
                  ? `${
                      stats.monthlyChange >= 0 ? "+" : ""
                    }${stats.monthlyChange.toFixed(1)}%`
                  : "+0.0%"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Total Saved</span>
              <span className='font-medium'>
                {stats ? formatCurrency(stats.totalSavings) : "$0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
