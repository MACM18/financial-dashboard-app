"use client"

import { useEffect } from "react"

export default function LoginPage() {
  useEffect(() => {
    window.location.href = "/handler/sign-in"
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Redirecting to Sign In...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we redirect you to the login page.</p>
        </div>
      </div>
    </div>
  )
}
