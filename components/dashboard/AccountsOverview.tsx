"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { AddAccountForm } from "./AddAccountForm";
import { EditAccountForm } from "./EditAccountForm";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import {
  Plus,
  CreditCard,
  Wallet,
  Banknote,
  Building2,
  TrendingUp,
  Coins,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

interface AccountType {
  name: string;
  description: string;
  icon: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  description: string;
  isActive: boolean;
  accountType: AccountType;
  createdAt: string;
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

export function AccountsOverview() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounts", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getAccountTypeColor = (typeName: string) => {
    switch (typeName) {
      case "checking":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "savings":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "credit_card":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "cash":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "investment":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "crypto":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getAccountIcon = (iconName: string) => {
    const IconComponent =
      AccountIcons[iconName as keyof typeof AccountIcons] || CreditCard;
    return <IconComponent className='h-5 w-5' />;
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowEditForm(true);
  };

  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50'>
        <CardHeader>
          <CardTitle className='text-blue-800 dark:text-blue-200'>
            Accounts Overview
          </CardTitle>
          <CardDescription>
            Manage your bank accounts, cards, and wallets
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
      <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50'>
        <CardHeader>
          <CardTitle className='text-blue-800 dark:text-blue-200'>
            Accounts Overview
          </CardTitle>
          <CardDescription>
            Manage your bank accounts, cards, and wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-red-600 text-sm'>{error}</p>
          <Button
            onClick={fetchAccounts}
            variant='outline'
            size='sm'
            className='mt-2'
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50'>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <CardTitle className='text-blue-800 dark:text-blue-200'>
              Accounts Overview
            </CardTitle>
            <CardDescription>
              Manage your bank accounts, cards, and wallets
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            size='sm'
            className='bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Account
          </Button>
        </div>
      </CardHeader>
      <CardContent className='max-h-96 overflow-y-auto'>
        {accounts.length === 0 ? (
          <div className='text-center py-8'>
            <CreditCard className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground'>No accounts found.</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Add your first account to start tracking your finances.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              size='sm'
              className='mt-4 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Your First Account
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Total Balance Card */}
            <div className='p-3 rounded-lg bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 sticky top-0 z-10'>
              <div className='text-center'>
                <p className='text-sm text-muted-foreground'>Total Balance</p>
                <p className='text-xl font-bold text-blue-800 dark:text-blue-200'>
                  {formatCurrency(getTotalBalance())}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Across {accounts.length} account
                  {accounts.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Accounts List - Scrollable */}
            <div className='space-y-2 max-h-64 overflow-y-auto pr-2'>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className='flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-gray-800/30 border border-blue-200/30 dark:border-blue-800/30 hover:bg-white/80 dark:hover:bg-gray-800/50 transition-colors'
                >
                  <div className='flex items-center space-x-3 flex-1 min-w-0'>
                    <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0'>
                      {getAccountIcon(account.accountType.icon)}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium truncate'>{account.name}</p>
                      <div className='flex items-center space-x-2'>
                        <Badge
                          variant='secondary'
                          className={`text-xs ${getAccountTypeColor(
                            account.accountType.name
                          )}`}
                        >
                          {account.accountType.name.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='text-right'>
                      <p
                        className={`font-semibold text-sm ${
                          account.balance >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex flex-col space-y-1'>
                      <Button
                        onClick={() => handleEditAccount(account)}
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        title='Edit account'
                      >
                        <Edit className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                      </Button>
                      <Button
                        onClick={() => handleDeleteAccount(account)}
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30'
                        title='Delete account'
                      >
                        <Trash2 className='h-4 w-4 text-red-600 dark:text-red-400' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <AddAccountForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onAccountAdded={fetchAccounts}
      />

      <EditAccountForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onAccountUpdated={fetchAccounts}
        account={selectedAccount}
      />

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onAccountDeleted={fetchAccounts}
        account={selectedAccount}
      />
    </Card>
  );
}
