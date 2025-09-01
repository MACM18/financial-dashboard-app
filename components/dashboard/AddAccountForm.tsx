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
import {
  CreditCard,
  Wallet,
  Banknote,
  Building2,
  TrendingUp,
  Coins,
  MoreHorizontal,
} from "lucide-react";

interface AccountType {
  name: string;
  description: string;
  icon: string;
}

interface AddAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded: () => void;
}

const AccountIcons = {
  CreditCard,
  Wallet,
  Banknote,
  Building2,
  TrendingUp,
  Coins,
  MoreHorizontal,
};

export function AddAccountForm({
  open,
  onOpenChange,
  onAccountAdded,
}: AddAccountFormProps) {
  const { user } = useAuth();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    accountTypeName: "",
    initialBalance: "",
    description: "",
  });

  useEffect(() => {
    if (open && user) {
      fetchAccountTypes();
    }
  }, [open, user]);

  const fetchAccountTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounts/types", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account types");
      }

      const data = await response.json();
      setAccountTypes(data.accountTypes || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load account types"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.accountTypeName) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          name: formData.name,
          accountTypeName: formData.accountTypeName,
          initialBalance: parseFloat(formData.initialBalance) || 0,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create account");
      }

      // Reset form
      setFormData({
        name: "",
        accountTypeName: "",
        initialBalance: "",
        description: "",
      });

      // Close dialog and refresh accounts
      onOpenChange(false);
      onAccountAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const getAccountIcon = (iconName: string) => {
    const IconComponent =
      AccountIcons[iconName as keyof typeof AccountIcons] || CreditCard;
    return <IconComponent className='h-5 w-5' />;
  };

  const getAccountTypeColor = (typeName: string) => {
    switch (typeName) {
      case "checking":
        return "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50";
      case "savings":
        return "border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-950/50";
      case "credit_card":
        return "border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-950/50";
      case "cash":
        return "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50";
      case "investment":
        return "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50";
      case "crypto":
        return "border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/30 dark:hover:bg-orange-950/50";
      default:
        return "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/30 dark:hover:bg-gray-950/50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Create a new account to track your finances across different
            sources.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner size='sm' />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'>
                <p className='text-red-600 dark:text-red-400 text-sm'>
                  {error}
                </p>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='name'>Account Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='e.g., Main Checking Account'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='accountType'>Account Type *</Label>
              <div className='grid grid-cols-2 gap-2'>
                {accountTypes.map((type) => (
                  <button
                    key={type.name}
                    type='button'
                    onClick={() =>
                      setFormData({ ...formData, accountTypeName: type.name })
                    }
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.accountTypeName === type.name
                        ? `ring-2 ring-blue-500 ${getAccountTypeColor(
                            type.name
                          )}`
                        : `${getAccountTypeColor(type.name)}`
                    }`}
                  >
                    <div className='flex items-center space-x-2'>
                      {getAccountIcon(type.icon)}
                      <div>
                        <p className='font-medium text-sm'>
                          {type.description}
                        </p>
                        <p className='text-xs text-muted-foreground capitalize'>
                          {type.name.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='initialBalance'>Initial Balance</Label>
              <Input
                id='initialBalance'
                type='number'
                step='0.01'
                min='0'
                value={formData.initialBalance}
                onChange={(e) =>
                  setFormData({ ...formData, initialBalance: e.target.value })
                }
                placeholder='0.00'
              />
              <p className='text-xs text-muted-foreground'>
                Enter the current balance for this account
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Input
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='e.g., Primary checking account for daily expenses'
              />
            </div>

            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  submitting || !formData.name || !formData.accountTypeName
                }
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size='sm' className='mr-2' />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
