"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BudgetTracker, BudgetRow } from "@/components/dashboard/BudgetTracker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Income",
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Subscriptions",
  "Personal",
  "Debt Repayment",
  "Savings",
];

export default function BudgetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString();
  const currentYear = now.getFullYear();

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`,
        {
          headers: { Authorization: `Bearer ${user.id}` },
        }
      );
      if (!res.ok) throw new Error("Failed to load budgets");
      const data = await res.json();
      const existing: BudgetRow[] = (data.budgets || []).map((b: any) => ({
        id: b.id,
        category: b.category,
        budgetedAmount: Number(b.budgetedAmount || 0),
        actualAmount: Number(b.actualAmount || 0),
        notes: b.notes || "",
        month: b.month,
        year: b.year,
      }));

      const merged = DEFAULT_CATEGORIES.map((cat) => {
        const found = existing.find((e) => e.category === cat);
        return (
          found || {
            category: cat,
            budgetedAmount: 0,
            actualAmount: 0,
            notes: "",
            month: currentMonth,
            year: currentYear,
          }
        );
      });

      const others = existing.filter(
        (e) => !DEFAULT_CATEGORIES.includes(e.category)
      );
      setBudgets([...merged, ...others]);
    } catch (err: any) {
      toast({
        title: "Error loading budgets",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentMonth, currentYear, toast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleUpdateBudget = (index: number, patch: Partial<BudgetRow>) => {
    setBudgets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const handleSaveBudget = async (index: number) => {
    const budget = budgets[index];
    if (!user) return;

    const id = budget.id || `new-${index}`;
    setSavingId(id);

    try {
      const method = budget.id ? "PUT" : "POST";
      const body = {
        ...budget,
        budgetedAmount: Number(budget.budgetedAmount),
        actualAmount: Number(budget.actualAmount),
        month: budget.month || currentMonth,
        year: budget.year || currentYear,
      };

      const res = await fetch("/api/budgets", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to save budget`);
      }

      const result = await res.json();
      if (result.budget) {
        setBudgets((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], ...result.budget };
          return copy;
        });
      }
      toast({ title: "Budget saved successfully" });
    } catch (err: any) {
      toast({
        title: "Error saving budget",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteBudget = async (index: number) => {
    const budget = budgets[index];
    if (!budget.id) {
      setBudgets((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    if (!user) return;

    try {
      const res = await fetch(`/api/budgets?id=${budget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.id}` },
      });
      if (!res.ok) throw new Error("Failed to delete budget");
      setBudgets((prev) => prev.filter((_, i) => i !== index));
      toast({ title: "Budget category deleted" });
    } catch (err: any) {
      toast({
        title: "Error deleting budget",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddBudgetRow = () => {
    setBudgets((prev) => [
      ...prev,
      {
        category: "",
        budgetedAmount: 0,
        actualAmount: 0,
        notes: "",
        month: currentMonth,
        year: currentYear,
      },
    ]);
  };

  const summary = React.useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgetedAmount, 0);
    const totalActual = budgets.reduce((sum, b) => sum + b.actualAmount, 0);
    const difference = totalBudgeted - totalActual;
    return { totalBudgeted, totalActual, difference };
  }, [budgets]);

  if (loading) {
    return <div>Loading budgets...</div>;
  }

  return (
    <div className='grid gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
          <CardDescription>
            Manage your budget for{" "}
            {now.toLocaleString("default", { month: "long" })} {currentYear}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid md:grid-cols-3 gap-4 mb-6 text-center'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Budgeted
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${summary.totalBudgeted.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Spent
                </CardTitle>
                <TrendingDown className='h-4 w-4 text-destructive' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${summary.totalActual.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Remaining</CardTitle>
                <TrendingUp
                  className={`h-4 w-4 ${
                    summary.difference >= 0
                      ? "text-green-500"
                      : "text-destructive"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    summary.difference >= 0 ? "" : "text-destructive"
                  }`}
                >
                  ${summary.difference.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <BudgetTracker
            budgets={budgets}
            onUpdateBudget={handleUpdateBudget}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
            onAddBudgetRow={handleAddBudgetRow}
            savingId={savingId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
