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
import { LoadingSpinner } from "./LoadingSpinner";

interface Activity {
  id: string;
  type: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  transactionType:
    | "expense"
    | "income"
    | "savings"
    | "payment"
    | "setup"
    | "tracking"
    | "info";
}

export function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/activities", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load activities"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getAmountColor = (transactionType: string, amount: number) => {
    switch (transactionType) {
      case "income":
        return "text-green-600 dark:text-green-400";
      case "expense":
        return "text-red-600 dark:text-red-400";
      case "savings":
        return "text-blue-600 dark:text-blue-400";
      case "payment":
        return "text-purple-600 dark:text-purple-400";
      case "setup":
      case "tracking":
        return "text-indigo-600 dark:text-indigo-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getAmountPrefix = (transactionType: string) => {
    switch (transactionType) {
      case "income":
      case "savings":
        return "+";
      case "expense":
      case "payment":
        return "-";
      default:
        return "";
    }
  };

  const formatActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case "budget_update":
        return `${activity.description} Budget`;
      case "savings_contribution":
        return `${activity.description} Goal`;
      case "debt_payment":
        return `${activity.description} Payment`;
      case "debt_tracking":
        return `${activity.description}`;
      default:
        return activity.description;
    }
  };

  if (loading) {
    return (
      <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
        <CardHeader>
          <CardTitle className='text-green-800 dark:text-green-200'>
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest financial transactions and updates
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
      <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
        <CardHeader>
          <CardTitle className='text-green-800 dark:text-green-200'>
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest financial transactions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-red-600 text-sm'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'>
      <CardHeader>
        <CardTitle className='text-green-800 dark:text-green-200'>
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest financial transactions and updates
        </CardDescription>
      </CardHeader>
      <CardContent className='max-h-96 overflow-y-auto'>
        <div className='space-y-3'>
          {activities.length === 0 ? (
            <div className='text-center py-6'>
              <p className='text-muted-foreground text-sm'>
                No recent activity found.
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Start by adding budgets, savings goals, or debts to see activity
                here.
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className='flex items-center justify-between p-2.5 rounded-lg bg-white/60 dark:bg-gray-800/30 border border-green-200/30 dark:border-green-800/30'
              >
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-sm truncate'>
                    {formatActivityDescription(activity)}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {activity.category}
                  </p>
                  {activity.date && (
                    <p className='text-xs text-muted-foreground'>
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`font-semibold text-sm ml-2 ${getAmountColor(
                    activity.transactionType,
                    activity.amount
                  )}`}
                >
                  {activity.transactionType === "info" || activity.amount === 0
                    ? "—"
                    : `${getAmountPrefix(
                        activity.transactionType
                      )}${formatCurrency(Math.abs(activity.amount))}`}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
