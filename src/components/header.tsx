"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "./user/avatar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { memo } from "react";

export const Header = memo(() => {
  const session = useSession();
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:shadow-primary/40 group-hover:scale-105">
              <Image
                src="/wn.png"
                alt="GreenChess Logo"
                width={26}
                height={26}
                className="object-contain drop-shadow-sm"
              />
            </div>
            <span className="text-xl hidden md:inline font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              GreenChess
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />{" "}
            {/* Vertical Divider */}
            {session.data ? (
              <UserAvatar session={session.data} />
            ) : auth.user ? (
              <UserAvatar session={{ user: auth.user }} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button
                    size="sm"
                    className="rounded-full px-5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

// Needed for proper display name in React DevTools since we used memo
Header.displayName = "Header";
