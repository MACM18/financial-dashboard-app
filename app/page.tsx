"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
                Take Control of Your
                <span className="text-primary"> Financial Future</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                Track your budget, monitor savings goals, and manage debt repayment with our comprehensive financial
                dashboard designed for your success.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you stay on top of your financial goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Budget Tracking</h3>
                <p className="text-muted-foreground text-pretty">
                  Monitor your income and expenses across different categories with real-time updates and progress
                  indicators.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Savings Goals</h3>
                <p className="text-muted-foreground text-pretty">
                  Set and track progress towards your financial goals with visual progress bars and milestone
                  celebrations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">💳</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Debt Management</h3>
                <p className="text-muted-foreground text-pretty">
                  Track your debt repayment progress, mark payments as complete, and stay motivated on your journey to
                  financial freedom.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to transform your financial life?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their finances with our intuitive dashboard.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/register">Start Your Journey Today</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
