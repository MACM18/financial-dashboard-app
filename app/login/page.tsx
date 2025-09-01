"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950'>
        <div className='text-center space-y-4'>
          <LoadingSpinner size='lg' />
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5' />
      <div className='relative z-10 w-full max-w-md'>
        <LoginForm />
      </div>
    </div>
  );
}
