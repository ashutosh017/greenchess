"use client";
import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signup } from "../actions/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SignUp() {
  const session = useSession();
  const auth = useAuth();
  const [state, formAction, isPending] = useActionState(signup, null);
  const router = useRouter();
  useEffect(() => {
    if (session.status === "authenticated" || auth.user) {
      router.push("/"); // or router.refresh() if needed
      console.log(session.status);
      console.log(auth.user);
    }
  }, [session, auth, state]);

  const error = state?.error;
  const success = state?.success;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-foreground/70">
              Join millions of chess players worldwide
            </p>
          </div>

          <Card className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-destructive/15 border border-destructive/30 rounded text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-primary/15 border border-primary/30 rounded text-primary text-sm">
                Account created successfully! Redirecting to sign in...
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Username
                </label>
                <Input
                  type="text"
                  name="username"
                  placeholder="your_username"
                  disabled={isPending || success}
                />
              </div>

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
                  disabled={isPending || success}
                />
                <p className="text-xs text-foreground/50 mt-1">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  disabled={isPending || success}
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border border-border mt-1"
                />
                <span className="text-xs text-foreground/70">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isPending || success}
              >
                {isPending
                  ? "Creating account..."
                  : success
                    ? "Account Created!"
                    : "Create Account"}
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
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary font-medium hover:underline"
              >
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
