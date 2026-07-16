import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Trophy, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { enforceUsername } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function AllPlayersPage() {
  await enforceUsername();
  const players = await prisma.user.findMany({
    orderBy: {
      rating: "desc",
    },
    select: {
      id: true,
      username: true,
      email: true,
      rating: true,
      image: true,
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Title / Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
            Leaderboard
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            All registered players on the platform ranked by rating.
          </p>
        </div>

        {/* Players List Card */}
        <Card className="overflow-hidden border border-border bg-card/60 backdrop-blur-sm shadow-xl">
          <div className="divide-y divide-border">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-7">Player</div>
              <div className="col-span-3 text-right pr-4">Rating</div>
            </div>

            {/* Players list */}
            {players.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 italic">
                No players registered yet.
              </div>
            ) : (
              players.map((player, index) => {
                const rank = index + 1;
                // Highlight top 3 ranks
                const isTopThree = rank <= 3;
                const rankColor = 
                  rank === 1 ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                  rank === 2 ? "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" :
                  rank === 3 ? "text-amber-600 bg-amber-600/10 border-amber-600/20" :
                  "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-transparent";

                return (
                  <div 
                    key={player.id} 
                    className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-muted/10 transition-colors duration-200 ${isTopThree ? "bg-amber-500/[0.02]" : ""}`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold ${rankColor}`}>
                        {rank === 1 ? <Trophy className="h-4 w-4" /> : rank}
                      </span>
                    </div>

                    {/* Username / Info */}
                    <div className="col-span-7 flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full bg-zinc-800 border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {player.image ? (
                          <img 
                            src={player.image} 
                            alt={player.username || "User"} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <User className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {player.username || "Anonymous"}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="col-span-3 text-right pr-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5">
                        {player.rating}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
