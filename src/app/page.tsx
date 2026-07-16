import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Trophy, Swords, Zap, Shield, Sparkles } from "lucide-react";

import { enforceUsername } from "@/app/actions/auth";

export default async function Home() {
  await enforceUsername();
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-background text-foreground relative overflow-x-hidden font-sans">
      {/* ================= BACKGROUND LAYERS ================= */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            conic-gradient(
              from 0deg at 50% 50%,
              rgba(128, 128, 128, 0.04) 0deg 90deg,
              transparent 90deg 180deg,
              rgba(128, 128, 128, 0.04) 180deg 270deg,
              transparent 270deg 360deg
            )
          `,
          backgroundSize: "120px 120px",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-background via-transparent to-background opacity-80 pointer-events-none"></div>
      <div className="fixed inset-0 z-[1] bg-gradient-to-r from-background via-transparent to-background opacity-80 pointer-events-none"></div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-16">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Chess Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/75">
              Master the Game of <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">GreenChess</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Experience chess like never before. Real-time matchmaking, competitive rating dynamics, live chess clocks, and a premium gaming interface.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/play"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 px-8 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200"
                )}
              >
                <Swords className="mr-2 h-5 w-5" />
                Play Now
              </Link>
              <Link
                href="/all_players"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-primary/30 hover:border-primary text-foreground hover:bg-primary/5 font-black py-6 px-8 text-lg rounded-xl shadow-md hover:-translate-y-0.5 transition-all duration-200"
                )}
              >
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Right Side: Chess Hero Render Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-[450px] aspect-[16/9] lg:aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/5 transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              
              <img
                src="/hero.jpg"
                alt="GreenChess Premium Hero Render"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* STATS COUNT */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-t border-b border-border/40">
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-black text-foreground">600</p>
            <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">Starting ELO</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-black text-emerald-500">+10 / -10</p>
            <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">Rating Change</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-black text-foreground">100%</p>
            <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">Real-time Sync</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-black text-foreground">Free</p>
            <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">Ad-Free Play</p>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">Why Play on GreenChess?</h2>
            <p className="text-muted-foreground font-medium">
              We provide a seamless and highly responsive multiplayer chess experience designed for enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card/45 backdrop-blur-sm shadow-md space-y-4 hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Instant Matchmaking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with active chess players globally in seconds. Our Pusher-backed matchmaking queues matches with zero delay.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card/45 backdrop-blur-sm shadow-md space-y-4 hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">ELO Rankings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rise up the ranks starting from an ELO of 600. Every victory adds 10 points and every loss deducts 10 points.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card/45 backdrop-blur-sm shadow-md space-y-4 hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Match Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every single move is validated on-the-fly against standard chess rules using a server-side engine to prevent cheating.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-8 border-t border-border/40 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GreenChess. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
