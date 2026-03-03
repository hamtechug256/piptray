'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  X,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  BarChart3,
  User,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { SITE_NAME, NAV_LINKS, SOCIAL_LINKS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                P
              </div>
              {SITE_NAME}
            </SheetTitle>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isAuthenticated && user ? (
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                    'text-muted-foreground hover:text-foreground hover:bg-muted',
                    'transition-colors'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Separator />

            {/* Dashboard Links (if authenticated) */}
            {isAuthenticated && (
              <nav className="p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
                  Account
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/wallet"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>
            )}

            <Separator />

            {/* Theme Toggle */}
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  logout();
                  onOpenChange(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            ) : (
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/register" onClick={() => onOpenChange(false)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign up
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={() => onOpenChange(false)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
