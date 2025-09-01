"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type BudgetRow = {
  id?: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  notes?: string;
  month?: string;
  year?: number;
};

const DEFAULT_CATEGORIES = [
  "Income",
  "Subscriptions",
  "Food",
  "Travel",
  "Debt Repayment",
  "Savings",
];

export function BudgetTracker() {
  const { user } = useAuth();
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  const currentYear = now.getFullYear();

  useEffect(() => {
    if (!user) return;
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchBudgets() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`,
        {
          headers: { Authorization: `Bearer ${user?.id}` },
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

      // Ensure default categories exist
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

      // Append any other custom categories from DB
      const others = existing.filter(
        (e) => !DEFAULT_CATEGORIES.includes(e.category)
      );
      setRows([...merged, ...others]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const budgeted = rows.reduce(
      (s, r) => s + Number(r.budgetedAmount || 0),
      0
    );
    const actual = rows.reduce((s, r) => s + Number(r.actualAmount || 0), 0);
    return { budgeted, actual };
  }, [rows]);

  function updateLocal(index: number, patch: Partial<BudgetRow>) {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  }

  async function saveRow(index: number) {
    const row = rows[index];
    if (!user) return;
    setSavingId(row.id || `new-${index}`);
    try {
      if (row.id) {
        // Update
        const res = await fetch(`/api/budgets`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.id}`,
          },
          body: JSON.stringify({
            id: row.id,
            category: row.category,
            budgetedAmount: Number(row.budgetedAmount || 0),
            actualAmount: Number(row.actualAmount || 0),
            notes: row.notes || "",
          }),
        });
        if (!res.ok) throw new Error("Failed to update budget");
      } else {
        // Create
        const res = await fetch(`/api/budgets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.id}`,
          },
          body: JSON.stringify({
            category: row.category,
            budgetedAmount: Number(row.budgetedAmount || 0),
            actualAmount: Number(row.actualAmount || 0),
            notes: row.notes || "",
            month: row.month || currentMonth,
            year: row.year || currentYear,
          }),
        });
        if (!res.ok) throw new Error("Failed to create budget");
        const data = await res.json();
        if (data?.budget?.id) {
          updateLocal(index, { id: data.budget.id });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  async function deleteRow(index: number) {
    const row = rows[index];
    if (!row.id || !user) {
      // just remove locally
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    try {
      const res = await fetch(`/api/budgets?id=${row.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.id}` },
      });
      if (!res.ok) throw new Error("Failed to delete budget");
      setRows((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error(err);
    }
  }

  function addEmptyRow() {
    setRows((prev) => [
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
  }

  return (
    <div>
      <div className='mb-4 flex justify-between items-center'>
        <h2 className='text-lg font-semibold'>
          Monthly Budget - {now.toLocaleString(undefined, { month: "long" })}{" "}
          {currentYear}
        </h2>
        <div className='flex gap-2'>
          <Button size='sm' onClick={addEmptyRow}>
            Add Row
          </Button>
          <Button size='sm' onClick={fetchBudgets}>
            Refresh
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Budgeted Amount</TableHead>
            <TableHead>Actual Amount</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id ?? `row-${i}`}>
              <TableCell>
                <Input
                  value={r.category}
                  onChange={(e) => updateLocal(i, { category: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type='number'
                  value={String(r.budgetedAmount)}
                  onChange={(e) =>
                    updateLocal(i, { budgetedAmount: Number(e.target.value) })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type='number'
                  value={String(r.actualAmount)}
                  onChange={(e) =>
                    updateLocal(i, { actualAmount: Number(e.target.value) })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  value={r.notes || ""}
                  onChange={(e) => updateLocal(i, { notes: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    onClick={() => saveRow(i)}
                    disabled={savingId === (r.id || `new-${i}`)}
                  >
                    {savingId === (r.id || `new-${i}`) ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => deleteRow(i)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Totals</TableCell>
            <TableCell>{totals.budgeted.toFixed(2)}</TableCell>
            <TableCell>{totals.actual.toFixed(2)}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export default BudgetTracker;
