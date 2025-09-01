"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950'>
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
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5' />
      <div className='relative z-10 w-full max-w-md'>
        <RegisterForm />
      </div>
    </div>
  );
}
