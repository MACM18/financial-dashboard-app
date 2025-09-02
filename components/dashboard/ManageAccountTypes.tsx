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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ManageAccountTypesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const iconOptions = Object.keys(AccountIcons);

export function ManageAccountTypes({
  open,
  onOpenChange,
}: ManageAccountTypesProps) {
  const { user } = useAuth();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "CreditCard",
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
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const url = editingId ? `/api/accounts/types` : "/api/accounts/types";

      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save account type");
      }

      // Reset form and refresh data
      setFormData({ name: "", description: "", icon: "CreditCard" });
      setEditingId(null);
      setShowAddForm(false);
      await fetchAccountTypes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save account type"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (accountType: AccountType) => {
    setFormData({
      name: accountType.name,
      description: accountType.description,
      icon: accountType.icon,
    });
    setEditingId(accountType.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this account type?")) return;

    try {
      setLoading(true);
      const response = await fetch("/api/accounts/types", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account type");
      }

      await fetchAccountTypes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete account type"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", icon: "CreditCard" });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = AccountIcons[iconName as keyof typeof AccountIcons];
    return IconComponent ? (
      <IconComponent className='w-5 h-5' />
    ) : (
      <CreditCard className='w-5 h-5' />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='w-5 h-5' />
            Manage Account Types
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove account types for your financial accounts.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className='bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3'>
            <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
          </div>
        )}

        <div className='space-y-6'>
          {/* Add New Button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className='w-full bg-blue-600 hover:bg-blue-700'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add New Account Type
            </Button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className='border-2 border-blue-200 dark:border-blue-800'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {editingId ? "Edit Account Type" : "Add New Account Type"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='name' className='flex items-center gap-1'>
                        Name
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='name'
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder='e.g., Checking Account'
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

                    <div className='space-y-2'>
                      <Label htmlFor='icon'>Icon</Label>
                      <select
                        id='icon'
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        className='w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='description'
                      className='flex items-center gap-1'
                    >
                      Description
                      <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='description'
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder='e.g., Standard checking account for daily transactions'
                      required
                      className={`transition-all duration-200 ${
                        !formData.description
                          ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/50 dark:bg-red-950/20"
                          : formData.description.length > 0
                          ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                          : ""
                      }`}
                    />
                  </div>

                  {/* Icon Preview */}
                  <div className='flex items-center gap-2 p-3 rounded-lg border bg-gray-50 dark:bg-gray-900'>
                    <span className='text-sm font-medium'>Preview:</span>
                    {getIcon(formData.icon)}
                    <span className='text-sm'>
                      {formData.name || "Account Name"}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {formData.description || "Description"}
                    </span>
                  </div>

                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className='w-4 h-4 mr-2' />
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={
                        loading || !formData.name || !formData.description
                      }
                      className='bg-green-600 hover:bg-green-700'
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size='sm' className='mr-2' />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className='w-4 h-4 mr-2' />
                          {editingId ? "Update" : "Create"} Account Type
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Account Types List */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Existing Account Types</h3>
            {loading && accountTypes.length === 0 ? (
              <div className='flex justify-center py-8'>
                <LoadingSpinner size='lg' />
              </div>
            ) : accountTypes.length === 0 ? (
              <Card>
                <CardContent className='text-center py-8'>
                  <Building2 className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No account types found
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Add your first account type to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {accountTypes.map((accountType) => (
                  <Card key={accountType.id} className='relative'>
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3 flex-1'>
                          <div className='p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'>
                            {getIcon(accountType.icon)}
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-medium'>{accountType.name}</h4>
                            <p className='text-sm text-muted-foreground'>
                              {accountType.description}
                            </p>
                          </div>
                        </div>
                        <div className='flex gap-1'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEdit(accountType)}
                            disabled={loading}
                          >
                            <Edit className='w-3 h-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleDelete(accountType.id)}
                            disabled={loading}
                            className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                          >
                            <Trash2 className='w-3 h-3' />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
