"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveUsername } from "../actions/user";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Sparkles, User, AlertCircle } from "lucide-react";

export default function SetupUsernamePage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  // If the user already has a username, send them to home
  useEffect(() => {
    if (!auth.loading && auth.user?.username) {
      router.replace("/");
    }
  }, [auth.user, auth.loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await saveUsername(username);
      if (res.success) {
        // Force refresh / navigation so the auth state updates
        window.location.href = "/";
      } else {
        setError(res.error || "Failed to set username");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-background text-foreground relative flex items-center justify-center font-sans p-4">
      {/* Background layers */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            conic-gradient(
              from 0deg at 50% 50%,
              rgba(128, 128, 128, 0.03) 0deg 90deg,
              transparent 90deg 180deg,
              rgba(128, 128, 128, 0.03) 180deg 270deg,
              transparent 270deg 360deg
            )
          `,
          backgroundSize: "120px 120px",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-background via-transparent to-background opacity-85 pointer-events-none"></div>

      <Card className="relative z-10 w-full max-w-md p-8 border border-border bg-card/60 backdrop-blur-md shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Choose your username</h1>
          <p className="text-sm text-zinc-400">
            Please select a unique username to complete your profile before entering the arena.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Username
            </label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="chessmaster123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-10 h-12 rounded-xl bg-muted/40 border-border focus:border-primary"
              />
              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-zinc-500" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
