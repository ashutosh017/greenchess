"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signin, signup } from "../actions/auth";
import { auth } from "@/lib/auth";
import { useActionState, useEffect } from "react";

export default function SignIn() {
  const session = useSession();
  const [state, formAction, isPending] = useActionState(signin, null);
  const router = useRouter();
  useEffect(() => {
    if (session.status === "authenticated" || state?.success) {
      router.push("/"); // or router.refresh() if needed
    }
  }, [session.status, state]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-foreground/70">
              Sign in to your GreenChess account
            </p>
          </div>

          <Card className="p-8">
            {state?.error && (
              <div className="mb-4 p-3 bg-destructive/15 border border-destructive/30 rounded text-destructive text-sm">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border border-border"
                  />
                  <span className="text-foreground/70">Remember me</span>
                </label>
                <Link
                  href="#"
                  className="text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-foreground/50">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => signIn("google")}
                variant="outline"
                disabled={isPending}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                onClick={() => signIn("github")}
                variant="outline"
                disabled={isPending}
              >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-foreground/70">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
