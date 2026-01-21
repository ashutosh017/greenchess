import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base">
            ♔
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
        </div>
      </div>
    </header>
  );
}
