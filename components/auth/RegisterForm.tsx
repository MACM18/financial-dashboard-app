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
import { UserPlus, Mail, Lock, User, Sparkles } from "lucide-react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(email, password, name);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-cyan-950/50 p-8 border border-border/50'>
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-400/10 dark:via-teal-400/10 dark:to-cyan-400/10' />
        <div className='relative z-10 text-center'>
          <div className='flex items-center justify-center gap-3 mb-4'>
            <Sparkles className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
            <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Financial Dashboard
            </h1>
          </div>
          <h2 className='text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-2'>
            Create Your Account
          </h2>
          <p className='text-muted-foreground text-lg'>
            Start managing your finances with powerful insights
          </p>
        </div>
      </div>

      {/* Registration Form */}
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
                htmlFor='name'
                className='text-gray-700 dark:text-gray-300 font-medium'
              >
                Full Name
              </Label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='name'
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder='Enter your full name'
                  className='pl-11 h-12 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400'
                />
              </div>
            </div>

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
                  className='pl-11 h-12 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400'
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
                  placeholder='Create a password'
                  className='pl-11 h-12 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='confirmPassword'
                className='text-gray-700 dark:text-gray-300 font-medium'
              >
                Confirm Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder='Confirm your password'
                  className='pl-11 h-12 bg-white/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400'
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200'
              disabled={loading}
            >
              {loading ? (
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Creating account...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <UserPlus className='h-5 w-5' />
                  Create Account
                </div>
              )}
            </Button>

            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>
                Already have an account?{" "}
                <a
                  href='/login'
                  className='font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors'
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
