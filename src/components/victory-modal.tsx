import React from "react";
import { Trophy, Sparkles, X, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGame?: () => void;
  opponentName: string | null;
  myColor: string | null;
}

export default function VictoryModal({
  isOpen,
  onClose,
  onNewGame,
  opponentName,
  myColor,
}: VictoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay with backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Card container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-950 p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center animate-in zoom-in-95 duration-300 z-10 font-sans">
        
        {/* Animated glow rings in the background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Trophy Section with animated glow */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/40">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse"></div>
          <Trophy className="h-12 w-12 text-amber-400 animate-bounce" />
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-300 animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-1 h-5 w-5 text-amber-300 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 uppercase drop-shadow">
          Victory!
        </h2>
        <p className="mb-6 text-zinc-300 text-sm font-medium">
          Congratulations, you have won the game!
        </p>

        {/* Details Card */}
        <div className="mb-8 rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 text-left space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Your Color:</span>
            <span className="font-bold text-white capitalize">{myColor || "Spectator"}</span>
          </div>
          <div className="h-px bg-zinc-800/80"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Opponent:</span>
            <span className="font-bold text-zinc-100">{opponentName || "Computer"}</span>
          </div>
          <div className="h-px bg-zinc-800/80"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Result:</span>
            <span className="font-bold text-emerald-400">Win (Opponent Left / Resigned / Checkmate)</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onNewGame && (
            <Button
              onClick={() => {
                onNewGame();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-zinc-950 font-bold border-none transition-all duration-200 py-6"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              New Match
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white hover:text-white py-6"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
