"use client";

import type React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Sidebar as DynamicSidebar } from "@/components/dashboard/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Simple navigation for page titles - the full navigation is in Sidebar component
const pageInfo = {
  "/dashboard": { name: "Dashboard", description: "Overview of your finances" },
  "/dashboard/budget": {
    name: "Budget Tracker",
    description: "Manage monthly budgets",
  },
  "/dashboard/savings": {
    name: "Savings Goals",
    description: "Track savings progress",
  },
  "/dashboard/debt": {
    name: "Debt Tracker",
    description: "Monitor debt repayment",
  },
  "/dashboard/settings": {
    name: "Settings",
    description: "Account preferences",
  },
};

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='lg:hidden'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Open sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-64 p-0'>
        <DynamicSidebar />
      </SheetContent>
    </Sheet>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src='' alt='User avatar' />
            <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold'>
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>Welcome back!</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user?.email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/dashboard/settings' className='cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer text-red-600 dark:text-red-400'
          onClick={handleLogout}
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full border-2 border-primary border-t-transparent h-12 w-12'></div>
          <p className='text-muted-foreground'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get current page info for breadcrumb
  const currentPage = pageInfo[pathname as keyof typeof pageInfo];
  const pageTitle = currentPage?.name || "Dashboard";
  const pageDescription = currentPage?.description || "Manage your finances";

  return (
    <div className='min-h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64'>
        <DynamicSidebar />
      </div>

      {/* Main Content */}
      <div className='lg:pl-64'>
        {/* Top Header */}
        <header className='sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border'>
          <div className='flex h-16 items-center justify-between px-4 lg:px-6'>
            <div className='flex items-center space-x-4'>
              <MobileSidebar />
              <div>
                <h1 className='text-lg font-semibold text-foreground'>
                  {pageTitle}
                </h1>
                <p className='text-sm text-muted-foreground hidden sm:block'>
                  {pageDescription}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='p-4 lg:p-6 space-y-6'>{children}</main>

        {/* Footer */}
        <footer className='border-t border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30'>
          <div className='mx-auto px-4 lg:px-6 py-6'>
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0'>
              <p className='text-sm text-muted-foreground'>
                © 2025 FinanceApp_MACM. Built for macm.dev by MACM.
              </p>
              {/* <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                <Link
                  href='/privacy'
                  className='hover:text-foreground transition-colors'
                >
                  Privacy
                </Link>
                <Link
                  href='/terms'
                  className='hover:text-foreground transition-colors'
                >
                  Terms
                </Link>
                <Link
                  href='/support'
                  className='hover:text-foreground transition-colors'
                >
                  Support
                </Link>
              </div> */}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
