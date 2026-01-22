"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface BoardPosition {
  piece: string | null;
  color: "white" | "black" | null;
}

type Board = BoardPosition[][];

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

const createInitialBoard = (): Board => {
  const board: Board = Array(8)
    .fill(null)
    .map(() =>
      Array(8)
        .fill(null)
        .map(() => ({ piece: null, color: null })),
    );

  const positions = [
    [0, "r"],
    [1, "n"],
    [2, "b"],
    [3, "q"],
    [4, "k"],
    [5, "b"],
    [6, "n"],
    [7, "r"],
  ];

  // Black pieces
  positions.forEach(([col, piece]) => {
    board[0][col as number] = { piece: piece as string, color: "black" };
  });
  for (let i = 0; i < 8; i++) {
    board[1][i] = { piece: "p", color: "black" };
  }

  // White pieces
  for (let i = 0; i < 8; i++) {
    board[6][i] = { piece: "P", color: "white" };
  }
  positions.forEach(([col, piece]) => {
    board[7][col as number] = {
      piece: (piece as string).toUpperCase(),
      color: "white",
    };
  });

  return board;
};

const isValidMove = (
  board: Board,
  from: [number, number],
  to: [number, number],
): boolean => {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (fromRow === toRow && fromCol === toCol) return false;
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;

  const piece = board[fromRow][fromCol];
  const target = board[toRow][toCol];

  if (!piece.piece) return false;
  if (target.piece && target.color === piece.color) return false;

  const pieceName = piece.piece.toLowerCase();
  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  switch (pieceName) {
    case "p": {
      const direction = piece.color === "white" ? -1 : 1;
      const startRow = piece.color === "white" ? 6 : 1;

      if (target.piece) {
        return colDiff === 1 && toRow - fromRow === direction;
      } else {
        if (colDiff !== 0) return false;
        if (toRow - fromRow === direction) return true;
        if (fromRow === startRow && toRow - fromRow === 2 * direction) {
          const middleRow = fromRow + direction;
          return !board[middleRow][fromCol].piece;
        }
        return false;
      }
    }
    case "n":
      return (
        (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      );
    case "b":
      if (rowDiff !== colDiff) return false;
      const bRowStep = toRow > fromRow ? 1 : -1;
      const bColStep = toCol > fromCol ? 1 : -1;
      for (let i = 1; i < rowDiff; i++) {
        if (board[fromRow + i * bRowStep][fromCol + i * bColStep].piece)
          return false;
      }
      return true;
    case "r":
      if (fromRow !== toRow && fromCol !== toCol) return false;
      if (fromRow === toRow) {
        const step = toCol > fromCol ? 1 : -1;
        for (let i = fromCol + step; i !== toCol; i += step) {
          if (board[fromRow][i].piece) return false;
        }
      } else {
        const step = toRow > fromRow ? 1 : -1;
        for (let i = fromRow + step; i !== toRow; i += step) {
          if (board[i][fromCol].piece) return false;
        }
      }
      return true;
    case "q":
      if (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) {
        if (fromRow === toRow) {
          const step = toCol > fromCol ? 1 : -1;
          for (let i = fromCol + step; i !== toCol; i += step) {
            if (board[fromRow][i].piece) return false;
          }
          return true;
        } else if (fromCol === toCol) {
          const step = toRow > fromRow ? 1 : -1;
          for (let i = fromRow + step; i !== toRow; i += step) {
            if (board[i][fromCol].piece) return false;
          }
          return true;
        } else {
          const rStep = toRow > fromRow ? 1 : -1;
          const cStep = toCol > fromCol ? 1 : -1;
          for (let i = 1; i < rowDiff; i++) {
            if (board[fromRow + i * rStep][fromCol + i * cStep].piece)
              return false;
          }
          return true;
        }
      }
      return false;
    case "k":
      return rowDiff <= 1 && colDiff <= 1;
    default:
      return false;
  }
};

export default function BoardPage() {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">(
    "white",
  );
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<string>("White to move");

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const handleSquareClick = (row: number, col: number) => {
    const square: [number, number] = [row, col];

    if (validMoves.some((move) => move[0] === row && move[1] === col)) {
      if (selectedSquare) {
        makeMove(selectedSquare, square);
      }
      return;
    }

    const piece = board[row][col];
    if (piece.piece && piece.color === currentPlayer) {
      setSelectedSquare(square);
      const moves: [number, number][] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (isValidMove(board, square, [r, c])) {
            moves.push([r, c]);
          }
        }
      }
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const makeMove = (from: [number, number], to: [number, number]) => {
    const newBoard = board.map((row) => [...row]);
    const piece = newBoard[from[0]][from[1]];
    const target = newBoard[to[0]][to[1]];

    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = { piece: null, color: null };

    const fromSquare = files[from[1]] + ranks[from[0]];
    const toSquare = files[to[1]] + ranks[to[0]];
    const moveNotation = `${piece.piece}${toSquare}${target.piece ? "x" : ""}`;

    setBoard(newBoard);
    setMoveHistory([...moveHistory, moveNotation]);
    setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
    setGameStatus(`${currentPlayer === "white" ? "Black" : "White"} to move`);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  const resetBoard = () => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer("white");
    setMoveHistory([]);
    setGameStatus("White to move");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Play Chess</h1>
          <Link href="/play">
            <Button variant="outline">Back to Play</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Board Section */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Player Info - Black */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">Computer (Black)</h3>
                    <p className="text-xs text-foreground/70">Rating: 1800</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">00:30</div>
                </div>
              </div>

              {/* Chess Board */}
              <div className="flex flex-col gap-1 bg-card border border-border p-4 rounded-lg mb-4 w-fit">
                <div className="flex gap-0">
                  <div className="w-10" />
                  {files.map((file) => (
                    <div
                      key={file}
                      className="w-14 h-14 flex items-center justify-center text-xs font-semibold text-foreground/50"
                    >
                      {file}
                    </div>
                  ))}
                </div>

                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-0">
                    <div className="w-10 h-14 flex items-center justify-center text-xs font-semibold text-foreground/50">
                      {ranks[rowIndex]}
                    </div>

                    {row.map((square, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      const isSelected =
                        selectedSquare?.[0] === rowIndex &&
                        selectedSquare?.[1] === colIndex;
                      const isValidMove = validMoves.some(
                        (move) => move[0] === rowIndex && move[1] === colIndex,
                      );
                      const isHighlighted = selectedSquare && isValidMove;

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                          className={`w-14 h-14 flex items-center justify-center text-4xl font-bold transition-all ${
                            isLight
                              ? "bg-amber-100 dark:bg-amber-900"
                              : "bg-amber-700 dark:bg-amber-800"
                          } ${isSelected ? "ring-4 ring-primary" : ""} ${
                            isHighlighted
                              ? "ring-4 ring-primary ring-inset opacity-80"
                              : ""
                          } ${!isSelected && isValidMove ? "cursor-pointer hover:opacity-70" : ""} hover:opacity-80`}
                        >
                          {isHighlighted && !square.piece && (
                            <div className="w-3 h-3 bg-primary rounded-full" />
                          )}
                          {square.piece && (
                            <span
                              className={
                                square.color === "white"
                                  ? "text-black dark:text-white"
                                  : "text-white dark:text-black"
                              }
                            >
                              {PIECES[square.piece as keyof typeof PIECES]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Player Info - White */}
              <div className="bg-card border border-border rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">You (White)</h3>
                    <p className="text-xs text-foreground/70">Rating: 1850</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">10:00</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Game Info Section */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Game Status</h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-card/50 border border-border">
                  <p className="text-sm text-foreground/70 mb-1">
                    Current Turn
                  </p>
                  <p className="text-lg font-bold text-primary">{gameStatus}</p>
                </div>

                <div className="p-3 rounded-lg bg-card/50 border border-border">
                  <p className="text-sm text-foreground/70 mb-1">Total Moves</p>
                  <p className="text-lg font-bold">{moveHistory.length}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={resetBoard}
                    className="w-full bg-primary hover:bg-primary/90 mb-2"
                  >
                    New Game
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Resign
                  </Button>
                </div>
              </div>
            </Card>

            {/* Move History */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Move History</h3>
              <div className="space-y-1 text-sm max-h-64 overflow-y-auto">
                {moveHistory.length === 0 ? (
                  <p className="text-foreground/50 text-xs">No moves yet</p>
                ) : (
                  moveHistory.map((move, idx) => (
                    <div
                      key={idx}
                      className="py-2 px-3 rounded bg-card/50 border border-border text-xs"
                    >
                      <span className="text-foreground/70">
                        Move {idx + 1}:
                      </span>{" "}
                      <span className="font-mono font-bold">{move}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
