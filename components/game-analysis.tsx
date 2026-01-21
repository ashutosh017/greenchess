import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Move {
  number: number;
  white: string;
  black?: string;
  evaluation: number;
  accuracy: number;
}

export function GameAnalysis() {
  const moves: Move[] = [
    { number: 1, white: 'e4', black: 'c5', evaluation: 0.2, accuracy: 100 },
    { number: 2, white: 'Nf3', black: 'd6', evaluation: 0.1, accuracy: 98 },
    { number: 3, white: 'd4', black: 'cxd4', evaluation: 0.3, accuracy: 96 },
    { number: 4, white: 'Nxd4', black: 'Nf6', evaluation: 0.2, accuracy: 94 },
    { number: 5, white: 'Nc3', black: 'a6', evaluation: 0.4, accuracy: 92 },
  ];

  return (
    <div className="space-y-6">
      {/* Game Info */}
      <Card className="p-6 border-border">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">White Player</p>
            <p className="font-semibold">ChessMaster99 (1850)</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Black Player</p>
            <p className="font-semibold">ProGamer88 (1920)</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Result</p>
            <p className="font-semibold">1-0</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time Control</p>
            <p className="font-semibold">5+0</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-semibold">Jan 15, 2024</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Move List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Move Analysis</h2>
          <Card className="overflow-hidden border-border">
            <div className="overflow-y-auto max-h-96">
              <div className="divide-y divide-border">
                {moves.map((move) => (
                  <div key={move.number} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Move {move.number}</p>
                        <p className="font-semibold">{move.white}</p>
                      </div>
                      {move.black && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Black</p>
                          <p className="font-semibold">{move.black}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Eval</p>
                        <p className="font-semibold text-primary">+{move.evaluation.toFixed(1)}</p>
                      </div>
                    </div>

                    {/* Accuracy Bar */}
                    <div className="flex gap-2 items-center">
                      <div className="flex-grow bg-muted rounded h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-primary h-1.5 rounded"
                          style={{ width: `${move.accuracy}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{move.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <Card className="p-6 border-border">
            <h3 className="font-bold mb-4">Game Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Moves</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Accuracy</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best Move %</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Time</span>
                <span className="font-medium">6.2s</span>
              </div>
            </div>
          </Card>

          {/* Opening */}
          <Card className="p-6 border-border">
            <h3 className="font-bold mb-2">Opening</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Sicilian Defense</p>
              <p className="text-muted-foreground">Najdorf Variation</p>
              <Button variant="outline" className="w-full mt-2 bg-transparent">
                Study This Opening
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full bg-primary hover:bg-primary/90">
              View Full Board
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Download PGN
            </Button>
          </div>
        </div>
      </div>

      {/* Key Moments */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Key Moments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { move: 'Move 15', title: 'Critical Position', description: 'Best move was found - gained +1.2 advantage' },
            { move: 'Move 28', title: 'Missed Tactic', description: 'Missed a forcing sequence worth +3.5' },
            { move: 'Move 35', title: 'Excellent Play', description: 'Executed endgame perfectly - advantage secured' },
          ].map((moment, idx) => (
            <Card key={idx} className="p-4 border-border hover:border-primary transition-colors">
              <p className="text-xs text-primary font-semibold mb-1">{moment.move}</p>
              <h3 className="font-bold mb-1">{moment.title}</h3>
              <p className="text-sm text-muted-foreground">{moment.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
