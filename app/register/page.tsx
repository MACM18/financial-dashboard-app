"use client"

import { useEffect } from "react"

export default function RegisterPage() {
  useEffect(() => {
    window.location.href = "/handler/sign-up"
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Redirecting to Sign Up...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we redirect you to the registration page.</p>
        </div>
      </div>
    </div>
  )
}
