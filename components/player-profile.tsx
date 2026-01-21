import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RatingStats {
  format: string;
  rating: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
}

export function PlayerProfile() {
  const ratingStats: RatingStats[] = [
    { format: 'Bullet', rating: 1945, games: 284, wins: 162, losses: 102, draws: 20 },
    { format: 'Blitz', rating: 1887, games: 456, wins: 245, losses: 178, draws: 33 },
    { format: 'Rapid', rating: 1823, games: 123, wins: 68, losses: 45, draws: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-8 border-border">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-grow">
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold">ChessMaster99</h1>
              <p className="text-muted-foreground">Member since January 2023</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <p className="text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold text-primary">62%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Games</p>
                <p className="text-lg font-bold text-primary">863</p>
              </div>
              <div>
                <p className="text-muted-foreground">Followers</p>
                <p className="text-lg font-bold text-primary">1,247</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-primary hover:bg-primary/90">Follow</Button>
              <Button variant="outline">Send Message</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Rating Statistics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Rating Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ratingStats.map((stat) => (
            <Card key={stat.format} className="p-6 border-border">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.format}</p>
                  <p className="text-3xl font-bold text-primary">{stat.rating}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Games</span>
                    <span className="font-medium">{stat.games}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wins</span>
                    <span className="font-medium text-green-400">{stat.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Losses</span>
                    <span className="font-medium text-red-400">{stat.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draws</span>
                    <span className="font-medium text-yellow-400">{stat.draws}</span>
                  </div>
                </div>

                {/* Win Rate Bar */}
                <div className="w-full bg-muted rounded h-2">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{ width: `${(stat.wins / stat.games) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Games</h2>
        <Card className="divide-y divide-border">
          {[
            { opponent: 'GrandmasterAlex', result: 'Won', rating: 2100, time: '2 hours ago' },
            { opponent: 'TacticalTina', result: 'Lost', rating: 1950, time: '5 hours ago' },
            { opponent: 'EndgameEric', result: 'Drew', rating: 1875, time: '1 day ago' },
          ].map((game, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex-grow">
                <p className="font-semibold">{game.opponent}</p>
                <p className="text-sm text-muted-foreground">{game.rating} rating • {game.time}</p>
              </div>
              <div className={`px-3 py-1 rounded font-semibold text-sm ${
                game.result === 'Won' ? 'bg-green-500/20 text-green-400' :
                game.result === 'Lost' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {game.result}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['🏆', '⚡', '🎯', '🔥', '💎', '👑', '🌟', '🎪'].map((emoji, idx) => (
            <Card key={idx} className="p-4 flex items-center justify-center hover:border-primary transition-colors">
              <span className="text-3xl">{emoji}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
