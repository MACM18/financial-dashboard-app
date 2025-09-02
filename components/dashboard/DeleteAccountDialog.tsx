"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { AlertTriangle, Trash2 } from "lucide-react";

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

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountDeleted: () => void;
  account: Account | null;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onAccountDeleted,
  account,
}: DeleteAccountDialogProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!account) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/accounts?id=${account.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      // Close dialog and refresh accounts
      onOpenChange(false);
      onAccountDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </p>
            </div>
          )}

          <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Account to be deleted:
            </h4>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {account.name}</p>
              <p><strong>Type:</strong> {account.accountType.description}</p>
              <p><strong>Balance:</strong> {formatCurrency(account.balance, account.currency)}</p>
              {account.description && (
                <p><strong>Description:</strong> {account.description}</p>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Important Notice:
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              All transactions associated with this account will be marked as &ldquo;Deleted Account&rdquo; 
              but will remain in your transaction history for record-keeping purposes.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}