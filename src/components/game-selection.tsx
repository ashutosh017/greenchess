import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GameMode {
  name: string;
  time: string;
  description: string;
  players: number;
  icon: string;
}

const gameModes: GameMode[] = [
  {
    name: "Bullet",
    time: "1+0",
    description: "Super fast chess, 1 minute per side",
    players: 2847,
    icon: "⚡",
  },
  {
    name: "Blitz",
    time: "5+0",
    description: "Fast paced chess, 5 minutes per side",
    players: 5432,
    icon: "🔥",
  },
  {
    name: "Rapid",
    time: "15+10",
    description: "Strategic chess, 15 minutes per side",
    players: 3891,
    icon: "⏱️",
  },
  {
    name: "Classical",
    time: "30+30",
    description: "Deep thinking chess, 30 minutes per side",
    players: 1245,
    icon: "🎓",
  },
];

export function GameSelection() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Play Chess Online</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Challenge opponents from around the world in various time formats.
          Choose your preferred game mode and start playing instantly.
        </p>
      </div>

      {/* Game Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameModes.map((mode) => (
          <Card
            key={mode.name}
            className="p-6 hover:border-primary transition-colors cursor-pointer hover:bg-card/80"
          >
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{mode.name}</h3>
                  <p className="text-primary font-semibold">{mode.time}</p>
                </div>
                <span className="text-3xl">{mode.icon}</span>
              </div>

              <p className="text-sm text-muted-foreground">
                {mode.description}
              </p>

              <div className="mt-auto">
                <p className="text-xs text-muted-foreground mb-3">
                  {mode.players.toLocaleString()} playing now
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Play {mode.name}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Featured Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="p-6 bg-card/50">
          <h3 className="text-lg font-bold mb-3">Learn Chess</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Master the fundamentals with interactive lessons and tactics
            puzzles.
          </p>
          <Button variant="outline" className="w-full bg-transparent">
            View Lessons
          </Button>
        </Card>

        <Card className="p-6 bg-card/50">
          <h3 className="text-lg font-bold mb-3">Analyze Games</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Review your games with computer analysis and improve your play.
          </p>
          <Button variant="outline" className="w-full bg-transparent">
            Upload PGN
          </Button>
        </Card>

        <Card className="p-6 bg-card/50">
          <h3 className="text-lg font-bold mb-3">Join Tournaments</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Compete in daily tournaments and climb the global rankings.
          </p>
          <Button variant="outline" className="w-full bg-transparent">
            Browse Tournaments
          </Button>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">50M+</p>
            <p className="text-sm text-muted-foreground mt-2">Players</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">1B+</p>
            <p className="text-sm text-muted-foreground mt-2">Games Played</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">180+</p>
            <p className="text-sm text-muted-foreground mt-2">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">24/7</p>
            <p className="text-sm text-muted-foreground mt-2">Always Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
