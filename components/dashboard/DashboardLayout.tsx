"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "./Sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ErrorBoundary } from "./ErrorBoundary"
import { LoadingSpinner } from "./LoadingSpinner"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Sidebar />

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
              <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
              <div className="flex-1" />
              <ThemeToggle />
            </div>
          </div>

          {/* Page content */}
          <main className="p-4 lg:p-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
