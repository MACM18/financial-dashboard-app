"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Bell, Shield, Palette, Database } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()

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
                  <Input id="name" defaultValue={user?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" defaultValue="USD" />
              </div>
              <Button>Save Changes</Button>
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
                  <Switch id="budget-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="goal-reminders">Goal Reminders</Label>
                  <Switch id="goal-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-due">Payment Due Dates</Label>
                  <Switch id="payment-due" defaultChecked />
                </div>
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
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Enable Two-Factor Authentication</Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">These actions are permanent and cannot be undone.</p>
              <div className="flex space-x-2">
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
                <Button variant="outline" size="sm">
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
              <Button variant="outline">Backup Data</Button>
              <Button variant="outline">Import Data</Button>
              <Button variant="outline">Reset All Data</Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Last backup: Never</p>
              <p>Data size: ~2.3 MB</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
