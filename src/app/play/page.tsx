"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameMode {
  name: string;
  time: string;
  description: string;
  players: number;
  icon: string;
  color: string;
}

const gameModes: GameMode[] = [
  {
    name: "Bullet",
    time: "1+0",
    description: "Super fast chess, 1 minute per side",
    players: 2847,
    icon: "⚡",
    color: "from-red-500 to-red-600",
  },
  {
    name: "Blitz",
    time: "5+0",
    description: "Fast paced chess, 5 minutes per side",
    players: 5432,
    icon: "🔥",
    color: "from-orange-500 to-orange-600",
  },
  {
    name: "Rapid",
    time: "15+10",
    description: "Strategic chess, 15 minutes per side",
    players: 3891,
    icon: "⏱️",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Classical",
    time: "30+30",
    description: "Deep thinking chess, 30 minutes per side",
    players: 1245,
    icon: "🎓",
    color: "from-purple-500 to-purple-600",
  },
];

const opponentModes = [
  {
    name: "Play Online",
    description: "Challenge players from around the world",
    icon: "🌍",
    subtext: "10M+ active players",
  },
  {
    name: "Play Computer",
    description: "Test your skills against AI opponents",
    icon: "🤖",
    subtext: "Adjustable difficulty levels",
  },
  {
    name: "Play Friend",
    description: "Challenge a friend with a unique link",
    icon: "👥",
    subtext: "Share and play together",
  },
];

export default function PlayPage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("blitz");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative">
        {/* Hero Section */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                Start Playing Now
              </h1>
              <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                Choose your game mode and opponent type to begin your chess
                journey. Play instantly with players worldwide or challenge the
                computer.
              </p>
            </div>

            {/* Opponent Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {opponentModes.map((mode) => (
                <Link
                  key={mode.name}
                  href={mode.name === "Play Online" ? "/play/online" : "#"}
                >
                  <button
                    onClick={() => setSelectedMode(mode.name)}
                    className={`p-6 rounded-lg border-2 transition-all text-left w-full ${
                      selectedMode === mode.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-4xl mb-3">{mode.icon}</div>
                    <h3 className="text-lg font-bold mb-1">{mode.name}</h3>
                    <p className="text-sm text-foreground/70 mb-2">
                      {mode.description}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {mode.subtext}
                    </p>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Game Mode Selection */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Select Time Control</h2>
            <p className="text-foreground/70">
              {selectedMode &&
                `Playing ${selectedMode} - Choose your preferred time format`}
            </p>
          </div>

          {/* Tabs for different time controls view */}
          <Tabs
            value={selectedTime}
            onValueChange={setSelectedTime}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="bullet">Bullet (1+0)</TabsTrigger>
              <TabsTrigger value="blitz">Blitz (5+0)</TabsTrigger>
              <TabsTrigger value="rapid">Rapid (15+10)</TabsTrigger>
              <TabsTrigger value="classical">Classical (30+30)</TabsTrigger>
            </TabsList>

            {/* Game Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gameModes.map((mode) => (
                <Card
                  key={mode.name}
                  className="p-6 hover:shadow-lg transition-all hover:border-primary group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{mode.name}</h3>
                      <p className="text-primary font-semibold text-sm mt-1">
                        {mode.time}
                      </p>
                    </div>
                    <span className="text-4xl">{mode.icon}</span>
                  </div>

                  <p className="text-sm text-foreground/70 mb-6">
                    {mode.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-card/50 rounded p-3">
                      <span className="text-xs text-foreground/60">
                        Online Now
                      </span>
                      <span className="font-bold text-sm">
                        {mode.players.toLocaleString()}
                      </span>
                    </div>

                    <Link href="/play/board">
                      <Button className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-md transition-all">
                        Play {mode.name}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </Tabs>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <Card className="p-6 bg-card/50 border-primary/20">
              <h3 className="text-lg font-bold mb-3">Tips for New Players</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>
                    Start with Blitz or Rapid for better thinking time
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Play against different rating levels to improve</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Review your games for valuable learning</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Use the puzzle section to sharpen tactics</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-card/50 border-primary/20">
              <h3 className="text-lg font-bold mb-3">Popular Features</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span>🎯</span>
                  <span>Match with players at your skill level</span>
                </li>
                <li className="flex gap-2">
                  <span>📊</span>
                  <span>Real-time rating calculations</span>
                </li>
                <li className="flex gap-2">
                  <span>🏆</span>
                  <span>Compete in daily tournaments</span>
                </li>
                <li className="flex gap-2">
                  <span>📈</span>
                  <span>Track your progress with statistics</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
            <p className="text-lg text-foreground/70 mb-8">
              Join thousands of players playing right now. No account? Sign up
              for free and start playing immediately.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Playing
              </Button>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Game Modes</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Bullet
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blitz
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Rapid
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Classical
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
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
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
            <p>&copy; 2024 ChessHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
