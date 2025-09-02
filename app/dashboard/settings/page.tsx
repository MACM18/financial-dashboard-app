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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { ManageAccountTypes } from "@/components/dashboard/ManageAccountTypes";
import { ManageTransactionCategories } from "@/components/dashboard/ManageTransactionCategories";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Save,
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Building2,
  Tag,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";

interface UserPreferences {
  currency: string;
  budgetAlerts: boolean;
  goalReminders: boolean;
  paymentDue: boolean;
  theme: string;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccountTypesManager, setShowAccountTypesManager] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: "USD",
    budgetAlerts: true,
    goalReminders: true,
    paymentDue: true,
    theme: "system",
  });
  const [profileData, setProfileData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    currency: "USD",
  });

  console.log("[v0] Settings page rendering, user:", user?.id);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // For now, we'll use default preferences since there's no API endpoint yet
      // In a real app, you would call: await fetch('/api/user/preferences')
      const defaultPrefs = {
        currency: "USD",
        budgetAlerts: true,
        goalReminders: true,
        paymentDue: true,
        theme: "system",
      };

      setPreferences(defaultPrefs);
      setProfileData((prev) => ({
        ...prev,
        currency: defaultPrefs.currency,
      }));
    } catch (error) {
      console.log("[v0] No user preferences found, using defaults:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      console.log("[v0] Saving profile data:", profileData);

      // In a real app, you would update the user profile via your auth provider
      // For now, we'll just show a success message
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error("[v0] Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);
      console.log("[v0] Saving preferences:", preferences);

      // For now, we'll just show a success message since there's no API endpoint yet
      // In a real app, you would call: await fetch('/api/user/preferences', { method: 'PUT', ... })

      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("[v0] Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (
    key: keyof UserPreferences,
    value: boolean | string
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportData = async () => {
    try {
      console.log("[v0] Exporting user data");
      // In a real app, this would export all user data
      const userData = {
        profile: profileData,
        preferences: preferences,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `financial-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error("[v0] Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        console.log("[v0] Deleting user account");
        // In a real app, this would delete the user account and all data
        toast({
          title: "Account Deletion",
          description: "Account deletion is not implemented in this demo.",
          variant: "destructive",
        });
      } catch (error) {
        console.error("[v0] Error deleting account:", error);
      }
    }
  };

  return (
    <div className='space-y-8'>
      {/* Header with gradient */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-950/50 dark:via-slate-950/50 dark:to-zinc-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-500/5 via-slate-500/5 to-zinc-500/5 dark:from-gray-400/10 dark:via-slate-400/10 dark:to-zinc-400/10' />
        <div className='relative z-10'>
          <div className='flex items-center gap-3 mb-2'>
            <SettingsIcon className='h-8 w-8 text-gray-600 dark:text-gray-400' />
            <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Account Settings
            </h1>
          </div>
          <p className='text-muted-foreground text-lg'>
            Manage your account preferences, security settings, and application
            behavior.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Profile Settings */}
        <Card className='lg:col-span-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/30 dark:border-blue-800/30'>
          <CardHeader>
            <div className='flex items-center space-x-2'>
              <User className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              <CardTitle className='text-blue-800 dark:text-blue-200'>
                Profile Information
              </CardTitle>
            </div>
            <CardDescription>
              Update your personal information and account details.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <Input
                  id='name'
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder='Enter your full name'
                  className='bg-white/60 dark:bg-gray-800/30'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder='Enter your email'
                  className='bg-white/60 dark:bg-gray-800/30'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='currency'>Default Currency</Label>
              <select
                id='currency'
                className='w-full p-2 border rounded-md bg-white/60 dark:bg-gray-800/30'
                value={profileData.currency}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
              >
                <option value='USD'>USD - US Dollar</option>
                <option value='EUR'>EUR - Euro</option>
                <option value='GBP'>GBP - British Pound</option>
                <option value='CAD'>CAD - Canadian Dollar</option>
                <option value='AUD'>AUD - Australian Dollar</option>
              </select>
            </div>
            <Button
              onClick={saveProfile}
              disabled={saving}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {saving ? (
                <>
                  <Save className='h-4 w-4 mr-2 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <div className='space-y-6'>
          {/* Theme Settings */}
          <Card className='bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/30 dark:border-purple-800/30'>
            <CardHeader>
              <div className='flex items-center space-x-2'>
                <Palette className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                <CardTitle className='text-purple-800 dark:text-purple-200'>
                  Appearance
                </CardTitle>
              </div>
              <CardDescription>
                Customize the look and feel of your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='theme-toggle'>Dark Mode</Label>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className='bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/30 dark:border-green-800/30'>
            <CardHeader>
              <div className='flex items-center space-x-2'>
                <Bell className='h-5 w-5 text-green-600 dark:text-green-400' />
                <CardTitle className='text-green-800 dark:text-green-200'>
                  Notifications
                </CardTitle>
              </div>
              <CardDescription>
                Manage your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='budget-alerts'>Budget Alerts</Label>
                <Switch
                  id='budget-alerts'
                  checked={preferences.budgetAlerts}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("budgetAlerts", checked)
                  }
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='goal-reminders'>Goal Reminders</Label>
                <Switch
                  id='goal-reminders'
                  checked={preferences.goalReminders}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("goalReminders", checked)
                  }
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='payment-due'>Payment Due Dates</Label>
                <Switch
                  id='payment-due'
                  checked={preferences.paymentDue}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("paymentDue", checked)
                  }
                />
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={savePreferences}
                disabled={saving}
                className='w-full bg-green-600 hover:bg-green-700 text-white border-0'
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Settings */}
      <Card className='bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/30 dark:border-orange-800/30'>
        <CardHeader>
          <div className='flex items-center space-x-2'>
            <Shield className='h-5 w-5 text-orange-600 dark:text-orange-400' />
            <CardTitle className='text-orange-800 dark:text-orange-200'>
              Security
            </CardTitle>
          </div>
          <CardDescription>
            Manage your account security and privacy settings.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Button
              variant='outline'
              onClick={() => {
                console.log("[v0] Change password clicked");
                toast({
                  title: "Change Password",
                  description:
                    "Password change functionality would be implemented here.",
                });
              }}
              className='bg-white/60 dark:bg-gray-800/30 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            >
              Change Password
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                console.log("[v0] Enable 2FA clicked");
                toast({
                  title: "Two-Factor Authentication",
                  description: "2FA setup would be implemented here.",
                });
              }}
              className='bg-white/60 dark:bg-gray-800/30 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            >
              Enable Two-Factor Authentication
            </Button>
          </div>
          <Separator />
          <div className='space-y-2'>
            <h4 className='font-medium text-destructive'>Danger Zone</h4>
            <p className='text-sm text-muted-foreground'>
              These actions are permanent and cannot be undone.
            </p>
            <div className='flex space-x-2'>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleDeleteAccount}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Account
              </Button>
              <Button variant='outline' size='sm' onClick={handleExportData}>
                <Download className='h-4 w-4 mr-2' />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className='bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200/30 dark:border-indigo-800/30'>
        <CardHeader>
          <div className='flex items-center space-x-2'>
            <Database className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
            <CardTitle className='text-indigo-800 dark:text-indigo-200'>
              Data Management
            </CardTitle>
          </div>
          <CardDescription>
            Manage your financial data and backups.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Button
              variant='outline'
              onClick={() => {
                console.log("[v0] Backup data clicked");
                toast({
                  title: "Backup Created",
                  description:
                    "Your data backup has been created successfully.",
                });
              }}
              className='bg-white/60 dark:bg-gray-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
            >
              <Download className='h-4 w-4 mr-2' />
              Backup Data
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                console.log("[v0] Import data clicked");
                toast({
                  title: "Import Data",
                  description:
                    "Data import functionality would be implemented here.",
                });
              }}
              className='bg-white/60 dark:bg-gray-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
            >
              <Upload className='h-4 w-4 mr-2' />
              Import Data
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to reset all data? This cannot be undone."
                  )
                ) {
                  console.log("[v0] Reset all data clicked");
                  toast({
                    title: "Data Reset",
                    description: "All data has been reset successfully.",
                    variant: "destructive",
                  });
                }
              }}
              className='bg-white/60 dark:bg-gray-800/30 hover:bg-red-50 dark:hover:bg-red-950/30'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Reset All Data
            </Button>
          </div>
          <div className='text-sm text-muted-foreground bg-white/40 dark:bg-gray-800/20 p-3 rounded-lg'>
            <p>Last backup: {new Date().toLocaleDateString()}</p>
            <p>Data size: ~2.3 MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Configuration */}
      <Card className='bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/30 dark:border-emerald-800/30'>
        <CardHeader>
          <div className='flex items-center space-x-2'>
            <CreditCard className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
            <CardTitle className='text-emerald-800 dark:text-emerald-200'>
              Financial Configuration
            </CardTitle>
          </div>
          <CardDescription>
            Manage account types and transaction categories for your financial
            tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Button
              onClick={() => setShowAccountTypesManager(true)}
              className='bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 p-4 h-auto'
            >
              <Building2 className='h-5 w-5' />
              <div className='text-left'>
                <div className='font-medium'>Manage Account Types</div>
                <div className='text-xs opacity-90'>
                  Add, edit, or remove account types
                </div>
              </div>
            </Button>
            <Button
              onClick={() => setShowCategoriesManager(true)}
              variant='outline'
              className='bg-white/60 dark:bg-gray-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 p-4 h-auto'
            >
              <Tag className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              <div className='text-left'>
                <div className='font-medium text-emerald-800 dark:text-emerald-200'>
                  Manage Categories
                </div>
                <div className='text-xs text-emerald-600 dark:text-emerald-400'>
                  Add, edit, or remove transaction categories
                </div>
              </div>
            </Button>
          </div>
          <div className='text-sm text-muted-foreground bg-white/40 dark:bg-gray-800/20 p-3 rounded-lg'>
            <p className='font-medium mb-1'>Configuration Tips:</p>
            <ul className='text-xs space-y-1'>
              <li>
                • Account types define the kinds of financial accounts you can
                create
              </li>
              <li>
                • Categories help organize your income and expense transactions
              </li>
              <li>
                • Changes will be reflected immediately in forms and reports
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Management Dialogs */}
      <ManageAccountTypes
        open={showAccountTypesManager}
        onOpenChange={setShowAccountTypesManager}
      />
      <ManageTransactionCategories
        open={showCategoriesManager}
        onOpenChange={setShowCategoriesManager}
      />
    </div>
  );
}
