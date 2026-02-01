"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";
import { UserAvatar } from "./user/avatar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { memo } from "react";

export const Header = memo(() => {
  const session = useSession();
  const auth = useAuth();
  console.log("auth in hader: ", auth);
  // console.log("session in header: ", session);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Image
              src="/wn.png" // Use "/" to reference the public folder
              alt="GreenChess Logo"
              width={24} // Required: 24px matches tailwind 'w-6'
              height={24} // Required: 24px matches tailwind 'h-6'
              // className="scale-x-[-1]"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">GreenChess</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Play
          </Link>
          <Link
            href="/analyze"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Analyze
          </Link>
          <Link
            href="/learn"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Learn
          </Link>
          <Link
            href="/community"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Community
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session.data ? (
            <UserAvatar session={session.data} />
          ) : auth.user ? (
            <UserAvatar session={{ user: auth.user }} />
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                >
                  Sign In
                </Button>
              </Link>

              <Link href="/signup">
                <Button
                  size="sm"
                  className="text-xs bg-primary hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});
