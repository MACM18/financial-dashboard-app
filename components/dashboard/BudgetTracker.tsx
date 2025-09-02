"use client";

import React from "react";
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
import { Trash2, Plus } from "lucide-react";

export type BudgetRow = {
  id?: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  notes?: string;
  month?: string;
  year?: number;
};

interface BudgetTrackerProps {
  budgets: BudgetRow[];
  onUpdateBudget: (index: number, patch: Partial<BudgetRow>) => void;
  onSaveBudget: (index: number) => void;
  onDeleteBudget: (index: number) => void;
  onAddBudgetRow: () => void;
  savingId?: string | null;
}

export function BudgetTracker({
  budgets,
  onUpdateBudget,
  onSaveBudget,
  onDeleteBudget,
  onAddBudgetRow,
  savingId,
}: BudgetTrackerProps) {
  const totals = React.useMemo(() => {
    const budgeted = budgets.reduce(
      (s, r) => s + Number(r.budgetedAmount || 0),
      0
    );
    const actual = budgets.reduce((s, r) => s + Number(r.actualAmount || 0), 0);
    return { budgeted, actual };
  }, [budgets]);

  return (
    <div>
      <div className='mb-4 flex justify-between items-center'>
        <h3 className='text-xl font-semibold'>Detailed Budget Breakdown</h3>
        <Button size='sm' onClick={onAddBudgetRow}>
          <Plus className='h-4 w-4 mr-2' />
          Add Category
        </Button>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[250px]'>Category</TableHead>
              <TableHead className='w-[180px]'>Budgeted Amount</TableHead>
              <TableHead className='w-[180px]'>Actual Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className='w-[180px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((r, i) => (
              <TableRow key={r.id ?? `row-${i}`}>
                <TableCell>
                  <Input
                    value={r.category}
                    onChange={(e) =>
                      onUpdateBudget(i, { category: e.target.value })
                    }
                    placeholder='e.g., Groceries'
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    value={String(r.budgetedAmount)}
                    onChange={(e) =>
                      onUpdateBudget(i, {
                        budgetedAmount: Number(e.target.value),
                      })
                    }
                    placeholder='0.00'
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    value={String(r.actualAmount)}
                    onChange={(e) =>
                      onUpdateBudget(i, {
                        actualAmount: Number(e.target.value),
                      })
                    }
                    placeholder='0.00'
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={r.notes || ""}
                    onChange={(e) =>
                      onUpdateBudget(i, { notes: e.target.value })
                    }
                    placeholder='Optional notes'
                  />
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex gap-2 justify-end'>
                    <Button
                      size='sm'
                      onClick={() => onSaveBudget(i)}
                      disabled={savingId === (r.id || `new-${i}`)}
                    >
                      {savingId === (r.id || `new-${i}`) ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => onDeleteBudget(i)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className='font-bold'>Totals</TableCell>
              <TableCell className='font-bold'>
                ${totals.budgeted.toFixed(2)}
              </TableCell>
              <TableCell className='font-bold'>
                ${totals.actual.toFixed(2)}
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

export default BudgetTracker;
