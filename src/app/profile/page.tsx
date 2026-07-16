import { getAuthenticatedUser, enforceUsername } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { User, Calendar, Award, CalendarDays, History, Play } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await enforceUsername();
  const authRes = await getAuthenticatedUser();
  if (!authRes.success || !authRes.data) {
    redirect("/signin");
  }

  const userId = authRes.data.id;

  // Fetch full user details from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/signin");
  }

  // Get total games count
  const totalGames = await prisma.game.count({
    where: {
      OR: [
        { whitePlayerId: userId },
        { blackPlayerId: userId }
      ]
    }
  });

  // Get wins count
  const wins = await prisma.game.count({
    where: { winnerId: userId }
  });

  // Get losses count
  const losses = await prisma.game.count({
    where: {
      AND: [
        { OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }] },
        { winnerId: { not: userId } },
        { winnerId: { not: null } }
      ]
    }
  });

  // Get draws
  const draws = totalGames - wins - losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  // Fetch recent 5 games
  const recentGames = await prisma.game.findMany({
    where: {
      OR: [
        { whitePlayerId: userId },
        { blackPlayerId: userId }
      ]
    },
    include: {
      whitePlayer: {
        select: { username: true, email: true }
      },
      blackPlayer: {
        select: { username: true, email: true }
      },
      winner: {
        select: { id: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  });

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Profile Card */}
        <Card className="p-8 border-border bg-card/60 backdrop-blur-sm shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            {/* Avatar */}
            <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-primary to-emerald-500 p-1 shadow-lg shadow-primary/20 shrink-0">
              <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.username || "User Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-zinc-500" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-grow text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {user.username || "Chess Player"}
                </h1>
                <p className="text-sm text-zinc-400 font-medium">{user.email}</p>
                <div className="mt-2 flex items-center justify-center md:justify-start gap-1.5 text-xs text-zinc-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {/* Stats Overview Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0 pt-4 border-t border-border/60">
                <div className="text-center md:text-left">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Win Rate</p>
                  <p className="text-2xl font-black text-emerald-500">{winRate}%</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Rating</p>
                  <p className="text-2xl font-black text-primary">{user.rating}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Games</p>
                  <p className="text-2xl font-black text-foreground">{totalGames}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ELO & Game stats breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-border bg-card/60 backdrop-blur-sm shadow-md text-center">
            <Award className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Current ELO</h3>
            <p className="text-4xl font-black text-foreground">{user.rating}</p>
            <p className="text-xs text-zinc-500 mt-1">Wins grant +10, losses deduct -10</p>
          </Card>

          <Card className="p-6 border-border bg-card/60 backdrop-blur-sm shadow-md text-center">
            <Play className="mx-auto h-8 w-8 text-emerald-500 mb-3" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Wins / Losses</h3>
            <p className="text-4xl font-black text-emerald-500">
              {wins} <span className="text-zinc-500 text-lg font-medium">/</span> <span className="text-red-500">{losses}</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">{draws} draw games played</p>
          </Card>

          <Card className="p-6 border-border bg-card/60 backdrop-blur-sm shadow-md text-center flex flex-col justify-center items-center">
            <CalendarDays className="h-8 w-8 text-zinc-500 mb-3" />
            <Link href="/play" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 font-bold shadow-md">
                Play New Game
              </Button>
            </Link>
          </Card>
        </div>

        {/* Recent Games */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-zinc-400" />
            <h2 className="text-2xl font-bold tracking-tight">Recent Games</h2>
          </div>

          <Card className="divide-y divide-border/60 overflow-hidden border border-border bg-card/60 backdrop-blur-sm shadow-lg">
            {recentGames.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 italic">
                You haven't played any games yet.
              </div>
            ) : (
              recentGames.map((game) => {
                const isWhite = game.whitePlayerId === userId;
                const opponent = isWhite ? game.blackPlayer : game.whitePlayer;
                const opponentName = opponent?.username || "Anonymous";
                
                let result = "Drew";
                let resultClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                
                if (game.winnerId === userId) {
                  result = "Won";
                  resultClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                } else if (game.winnerId) {
                  result = "Lost";
                  resultClass = "bg-red-500/10 text-red-500 border-red-500/20";
                }

                const gameDate = new Date(game.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div key={game.id} className="p-5 flex items-center justify-between hover:bg-muted/10 transition-colors duration-200">
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-foreground truncate">
                        vs {opponentName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Played as {isWhite ? "White" : "Black"} • {gameDate}
                      </p>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${resultClass}`}>
                      {result}
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
