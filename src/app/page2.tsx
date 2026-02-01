"use client";

import { useEffect, useState } from "react";
import { GameSelection } from "@/components/game-selection";
import { ChessBoard } from "@/components/chess-board";
import { PlayerProfile } from "@/components/player-profile";
import { GameAnalysis } from "@/components/game-analysis";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "home" | "play" | "profile" | "analysis"
  >("home");

  return (
    <div className="min-h-screen text-foreground ">
      <Header />
      <main className="relative top-0">
        {/* Hero Section */}
        <section className="border-b border-border flex items-center ">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Play Chess Online
              </h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8">
                Challenge players worldwide, analyze your games, and improve
                your skills on the world's leading chess platform.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href={"/play"}
                  className={cn(
                    buttonVariants({
                      className: "bg-primary hover:bg-primary/90",
                    }),
                  )}
                >
                  Start Playing Now
                </Link>
                <Button size="lg" variant="outline">
                  Watch Tutorial
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="home">Play</TabsTrigger>
              <TabsTrigger value="play">Game Board</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-8">
              <GameSelection />
            </TabsContent>

            <TabsContent value="play" className="space-y-8">
              <ChessBoard />
            </TabsContent>

            <TabsContent value="profile" className="space-y-8">
              <PlayerProfile />
            </TabsContent>

            <TabsContent value="analysis" className="space-y-8">
              <GameAnalysis />
            </TabsContent>
          </Tabs>
        </section>

        {/* Stats Section */}
        <section className="border-t border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10M+</div>
                <div className="text-foreground/70">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">500M+</div>
                <div className="text-foreground/70">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-foreground/70">Countries</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Play</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Bullet Chess
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blitz Chess
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Rapid Chess
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Learn</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Lessons
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Puzzles
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Coach
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Forum
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Tournaments
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Clubs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-sm text-foreground/70 text-center">
            <p>&copy; 2024 GreenChess. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
