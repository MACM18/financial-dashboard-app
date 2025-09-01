"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Mail, Lock, Sparkles } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-400/10 dark:via-indigo-400/10 dark:to-purple-400/10' />
        <div className='relative z-10 text-center'>
          <div className='flex items-center justify-center gap-3 mb-4'>
            <Sparkles className='h-8 w-8 text-indigo-600 dark:text-indigo-400' />
            <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Financial Dashboard
            </h1>
          </div>
          <h2 className='text-2xl font-bold text-indigo-800 dark:text-indigo-200 mb-2'>
            Welcome Back
          </h2>
          <p className='text-muted-foreground text-lg'>
            Sign in to access your financial insights
          </p>
        </div>
      </div>

      {/* Login Form */}
      <Card className='bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50 border-gray-200/50 dark:border-gray-800/50 shadow-xl'>
        <CardContent className='p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <Alert
                variant='destructive'
                className='bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              >
                <AlertDescription className='text-red-800 dark:text-red-200'>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-gray-700 dark:text-gray-300 font-medium'
              >
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder='Enter your email'
                  className='pl-11 h-12 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-gray-700 dark:text-gray-300 font-medium'
              >
                Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder='Enter your password'
                  className='pl-11 h-12 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200'
              disabled={loading}
            >
              {loading ? (
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Signing in...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <LogIn className='h-5 w-5' />
                  Sign In
                </div>
              )}
            </Button>

            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>
                Don't have an account?{" "}
                <a
                  href='/register'
                  className='font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors'
                >
                  Create account
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
