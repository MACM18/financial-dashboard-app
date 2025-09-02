"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  description: string;
  isActive: boolean;
  accountType: {
    name: string;
    description: string;
    icon: string;
  };
  createdAt: string;
}

interface EditAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated: () => void;
  account: Account | null;
}

export function EditAccountForm({
  open,
  onOpenChange,
  onAccountUpdated,
  account,
}: EditAccountFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    description: "",
  });

  useEffect(() => {
    if (account && open) {
      setFormData({
        name: account.name,
        balance: account.balance.toString(),
        description: account.description || "",
      });
      setError(null);
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) return;

    // Trim whitespace from inputs
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/accounts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          id: account.id,
          name: formData.name,
          balance: parseFloat(formData.balance) || 0,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update account");
      }

      // Close dialog and refresh accounts
      onOpenChange(false);
      onAccountUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
    } finally {
      setSubmitting(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update your account details and balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              Account Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Main Checking Account"
              required
              className={`transition-all duration-200 ${
                !formData.name
                  ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/50 dark:bg-red-950/20"
                  : formData.name.length > 0
                  ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                  : ""
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance" className="flex items-center gap-1">
              Current Balance
            </Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) =>
                setFormData({ ...formData, balance: e.target.value })
              }
              placeholder="0.00"
              className={`transition-all duration-200 ${
                formData.balance !== "" && formData.balance !== "0"
                  ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                  : ""
              }`}
            />
            <p className="text-xs text-muted-foreground">
              Update the current balance for this account
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              Description
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g., Primary checking account for daily expenses"
              className={`transition-all duration-200 ${
                formData.description !== ""
                  ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                  : ""
              }`}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              className={`transition-all duration-200 ${
                submitting || !formData.name.trim()
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-xl"
              }`}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}