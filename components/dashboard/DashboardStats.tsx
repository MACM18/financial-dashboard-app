import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface DashboardStat {
  title: string;
  value: string | number;
  numericValue?: number;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
}

const iconMap = {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
};

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currency } = useCurrency();

  console.log(
    "[v0] DashboardStats rendering, user:",
    user?.id,
    "loading:",
    loading
  );

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      console.log("[v0] Loading dashboard stats");
      setLoading(true);

      if (!user?.id) {
        console.log("[v0] No user found");
        return;
      }

      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      console.log("[v0] Dashboard stats loaded:", data);

      // Convert icon strings to components and format currency values
      const calculatedStats: DashboardStat[] = data.stats.map((stat: any) => ({
        ...stat,
        value: typeof stat.numericValue === 'number' ? formatCurrency(stat.numericValue, currency) : stat.value,
        icon: iconMap[stat.icon as keyof typeof iconMap] || DollarSign,
      }));

      console.log("[v0] Calculated stats:", calculatedStats);
      setStats(calculatedStats);
    } catch (error) {
      console.error("[v0] Error loading dashboard stats:", error);
      setStats([
        {
          title: "Total Budget",
          value: formatCurrency(0, currency),
          change: "Set up your budget",
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          title: "Monthly Spending",
          value: formatCurrency(0, currency),
          change: "No spending tracked",
          trend: "down" as const,
          icon: TrendingDown,
        },
        {
          title: "Savings Progress",
          value: "0%",
          change: "Create savings goals",
          trend: "up" as const,
          icon: Target,
        },
        {
          title: "Debt Remaining",
          value: formatCurrency(0, currency),
          change: "No debts tracked",
          trend: "down" as const,
          icon: TrendingUp,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className='flex items-center justify-center h-24'>
              <LoadingSpinner size='sm' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              {stat.title}
            </CardTitle>
            <stat.icon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-card-foreground'>
              {stat.value}
            </div>
            <p
              className={`text-xs ${
                stat.trend === "up"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
