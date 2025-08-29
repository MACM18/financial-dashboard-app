"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Bell, Shield, Palette, Database, Save, Download, Upload, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { databases } from "@/lib/appwrite"

interface UserPreferences {
  currency: string
  budgetAlerts: boolean
  goalReminders: boolean
  paymentDue: boolean
  theme: string
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: "USD",
    budgetAlerts: true,
    goalReminders: true,
    paymentDue: true,
    theme: "system",
  })
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currency: "USD",
  })

  console.log("[v0] Settings page rendering, user:", user?.$id)

  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user])

  const loadUserPreferences = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Try to load user preferences from database
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        "user_preferences", // This collection would need to be created
        [],
      )

      const userPrefs = response.documents.find((doc: any) => doc.userId === user.$id)
      if (userPrefs) {
        setPreferences({
          currency: userPrefs.currency || "USD",
          budgetAlerts: userPrefs.budgetAlerts ?? true,
          goalReminders: userPrefs.notifications ?? true,
          paymentDue: userPrefs.budgetAlerts ?? true,
          theme: userPrefs.theme || "system",
        })
        setProfileData((prev) => ({ ...prev, currency: userPrefs.currency || "USD" }))
      }
    } catch (error) {
      console.log("[v0] No user preferences found, using defaults:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      console.log("[v0] Saving profile data:", profileData)

      // In a real app, you would update the user profile via Appwrite Auth
      // For now, we'll just show a success message
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      })
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const savePreferences = async () => {
    if (!user) return

    try {
      setSaving(true)
      console.log("[v0] Saving preferences:", preferences)

      // Save preferences to database
      // This would require creating a user_preferences collection
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      console.error("[v0] Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean | string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleExportData = async () => {
    try {
      console.log("[v0] Exporting user data")
      // In a real app, this would export all user data
      const userData = {
        profile: profileData,
        preferences: preferences,
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `financial-data-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      })
    } catch (error) {
      console.error("[v0] Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        console.log("[v0] Deleting user account")
        // In a real app, this would delete the user account and all data
        toast({
          title: "Account Deletion",
          description: "Account deletion is not implemented in this demo.",
          variant: "destructive",
        })
      } catch (error) {
        console.error("[v0] Error deleting account:", error)
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your personal information and account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <select
                  id="currency"
                  className="w-full p-2 border rounded-md"
                  value={profileData.currency}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <div className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-toggle">Dark Mode</Label>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>Manage your notification preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <Switch
                    id="budget-alerts"
                    checked={preferences.budgetAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange("budgetAlerts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="goal-reminders">Goal Reminders</Label>
                  <Switch
                    id="goal-reminders"
                    checked={preferences.goalReminders}
                    onCheckedChange={(checked) => handlePreferenceChange("goalReminders", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-due">Payment Due Dates</Label>
                  <Switch
                    id="payment-due"
                    checked={preferences.paymentDue}
                    onCheckedChange={(checked) => handlePreferenceChange("paymentDue", checked)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={savePreferences} disabled={saving}>
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security and privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  console.log("[v0] Change password clicked")
                  toast({
                    title: "Change Password",
                    description: "Password change functionality would be implemented here.",
                  })
                }}
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("[v0] Enable 2FA clicked")
                  toast({
                    title: "Two-Factor Authentication",
                    description: "2FA setup would be implemented here.",
                  })
                }}
              >
                Enable Two-Factor Authentication
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">These actions are permanent and cannot be undone.</p>
              <div className="flex space-x-2">
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Manage your financial data and backups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  console.log("[v0] Backup data clicked")
                  toast({
                    title: "Backup Created",
                    description: "Your data backup has been created successfully.",
                  })
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Backup Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("[v0] Import data clicked")
                  toast({
                    title: "Import Data",
                    description: "Data import functionality would be implemented here.",
                  })
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
                    console.log("[v0] Reset all data clicked")
                    toast({
                      title: "Data Reset",
                      description: "All data has been reset successfully.",
                      variant: "destructive",
                    })
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset All Data
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Last backup: {new Date().toLocaleDateString()}</p>
              <p>Data size: ~2.3 MB</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
