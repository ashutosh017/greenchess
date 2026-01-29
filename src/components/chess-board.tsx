"use client";

import { useState } from "react";

const PIECES = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const INITIAL_BOARD = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

export function ChessBoard() {
  const [board] = useState(INITIAL_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-6">
        {/* Board */}
        <div className="flex flex-col gap-1">
          {/* Rank labels */}
          <div className="flex gap-0">
            <div className="w-10" />
            {files.map((file) => (
              <div
                key={file}
                className="w-14 h-14 flex items-center justify-center text-xs font-semibold text-muted-foreground"
              >
                {file}
              </div>
            ))}
          </div>

          {/* Board rows */}
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-0">
              {/* File labels */}
              <div className="w-10 h-14 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {ranks[rowIndex]}
              </div>

              {/* Squares */}
              {row.map((piece, colIndex) => {
                const isLightSquare = (rowIndex + colIndex) % 2 === 0;
                const isSelected =
                  selectedSquare?.[0] === rowIndex &&
                  selectedSquare?.[1] === colIndex;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => setSelectedSquare([rowIndex, colIndex])}
                    className={`w-14 h-14 flex items-center justify-center text-4xl font-bold transition-colors ${
                      isLightSquare ? "bg-amber-100" : "bg-amber-700"
                    } ${isSelected ? "ring-2 ring-primary" : ""} hover:opacity-80`}
                  >
                    {piece ? PIECES[piece as keyof typeof PIECES] : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Game Info */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4">White (You)</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">1850</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium font-mono">10:45</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4">Black</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">1872</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium font-mono">11:20</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Move History</h3>
            <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
              <p className="text-muted-foreground">1. e4 c5</p>
              <p className="text-muted-foreground">2. Nf3 d6</p>
              <p className="text-muted-foreground">3. d4 cxd4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
