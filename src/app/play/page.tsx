"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher-client";
import { handleMove, triggerMatchMaking } from "../actions/game";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import FramerMatchmaking from "@/components/framer-matchmaking";
import VersusMatchmaking from "@/components/versus-matchmaking";
import MatchmakingOverlay from "@/components/matchmaking-overlay";
import { useRouter } from "next/navigation";

interface BoardPosition {
  piece: string | null;
  color: "white" | "black" | null;
}

type Board = BoardPosition[][];

const PIECES = {
  K: "./wk.png",
  Q: "./wq.png",
  R: "./wr.png",
  B: "./wb.png",
  N: "./wn.png",
  P: "./wp.png",
  k: "./bk.png",
  q: "./bq.png",
  r: "./br.png",
  b: "./bb.png",
  n: "./bn.png",
  p: "./bp.png",
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
  const auth = useAuth();
  const session = useSession();
  const router = useRouter();
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
  const [matchMaking, setMatchMaking] = useState<boolean>(false);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [playerOnWhite, setPlayerOnWhite] = useState<string | null>(null);
  const [playerOnBlack, setPlayerOnBlack] = useState<string | null>("");
  const [userId, setUserId] = useState<string | null>("");
  const [roomId, setRoomId] = useState<string | null>(null);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  // Helper to convert indices [row, col] to "a8", "e2", etc.
  const toChessNotation = (row: number, col: number) => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"]; // Rank 8 is row 0
    return `${files[col]}${ranks[row]}`;
  };

  // Inside your component...
  const handleSquareClick = async (row: number, col: number) => {
    const square: [number, number] = [row, col];

    // --- CASE 1: ATTEMPTING TO MOVE ---
    if (validMoves.some((move) => move[0] === row && move[1] === col)) {
      if (selectedSquare) {
        // 1. Perform Local Update (Optimistic UI)
        // Keeps the game feeling snappy while server processes
        makeMove(selectedSquare, square);

        // 2. Clear selection immediately
        setSelectedSquare(null);
        setValidMoves([]);

        // 3. Prepare data for Server
        const fromNotation = toChessNotation(
          selectedSquare[0],
          selectedSquare[1],
        );
        const toNotation = toChessNotation(row, col);

        // Check if this is a pawn promotion (Pawn reaching last rank)
        const isPawn =
          selectedSquare &&
          board[selectedSquare[0]][selectedSquare[1]].piece
            ?.toLowerCase()
            .includes("p");
        const isPromotion = isPawn && (row === 0 || row === 7);

        // 4. Call Server Action
        try {
          await handleMove(
            roomId || "", // You must have this from props/context
            {
              from: fromNotation,
              to: toNotation,
              promotion: isPromotion ? "q" : undefined, // Auto-promote to Queen for simplicity
            },
            userId || "", // You must have this from props/session
          );
        } catch (error) {
          console.error("Move failed on server:", error);
          // Optional: Revert the board state here if the server request fails
          // fetchGameState();
        }
      }
      return;
    }

    // --- CASE 2: SELECTING A PIECE ---
    const piece = board[row][col];

    // Only allow selection if it's the user's turn (optional, but good UX)
    // const isMyTurn = currentTurn === myColor;

    if (piece.piece && piece.color === currentPlayer) {
      setSelectedSquare(square);
      const moves: [number, number][] = [];

      // Calculate valid moves locally for the UI highlights
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (isValidMove(board, square, [r, c])) {
            moves.push([r, c]);
          }
        }
      }
      setValidMoves(moves);
    } else {
      // Deselect if clicking empty square or enemy piece (without a valid move)
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };
  // Helper: Convert FEN string (e.g. "rnbqk...") to your Board array format
  const fenToBoard = (fen: string): Board => {
    const [position] = fen.split(" "); // Get just the piece placement part
    const rows = position.split("/");

    return rows.map((row) => {
      const newRow: BoardPosition[] = [];
      for (const char of row) {
        if (!isNaN(Number(char))) {
          // It's a number (empty squares), add nulls
          for (let i = 0; i < Number(char); i++) {
            newRow.push({ piece: null, color: null });
          }
        } else {
          // It's a piece letter
          const isWhite = char === char.toUpperCase();
          const pieceType = char.toLowerCase(); // 'p', 'r', 'n', etc.
          // Map FEN char to your piece code (e.g., 'P' -> 'wP', 'r' -> 'bR')
          const pieceCode = (isWhite ? "w" : "b") + pieceType.toUpperCase();

          newRow.push({
            piece: pieceCode, // Matches your PIECES keys like 'wP', 'bK'
            color: isWhite ? "white" : ("black" as const),
          });
        }
      }
      return newRow;
    });
  };

  // Inside your component...
  useEffect(() => {
    if (!roomId) return;

    // 1. Subscribe to the specific room channel
    const channel = pusherClient.subscribe(`room-${roomId}`);

    // 2. Listen for 'game-update' events from the server
    channel.bind("game-update", (data: any) => {
      const { fen, turn, lastMove, status, winner } = data;

      // A. Update the board immediately with server truth
      const newBoard = fenToBoard(fen);
      setBoard(newBoard);

      // B. Update turn state ('w' -> 'white', 'b' -> 'black')
      const nextPlayer = turn === "w" ? "white" : "black";
      setCurrentPlayer(nextPlayer);

      // C. Update Status Text
      if (status === "finished") {
        setGameStatus(
          `Game Over! ${winner === "draw" ? "Draw" : winner + " wins"}`,
        );
      } else {
        setGameStatus(`${nextPlayer === "white" ? "White" : "Black"} to move`);
      }

      // D. Update Move History (Optional: Add notation if server sends it, or minimal update)
      if (lastMove) {
        // You might want to format this better or rely on server to send full PGN later
        setMoveHistory((prev) => [...prev, `${lastMove.from}-${lastMove.to}`]);
      }

      // E. Clear selection state so no artifacts remain
      setSelectedSquare(null);
      setValidMoves([]);
    });

    // 3. Cleanup on unmount
    return () => {
      pusherClient.unsubscribe(`room-${roomId}`);
    };
  }, [roomId]);
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

    if (!userId) {
      return;
    }
    triggerMatchMaking(userId);
    setMatchMaking(true);
  };
  useEffect(() => {
    if (!auth.user && session.status === "unauthenticated") {
      return;
    }
    const userId = auth.user?.id || session.data?.user?.id;
    if (!userId) {
      return;
    }
    setUserId(userId);
  }, [auth, session]);
  useEffect(() => {
    const channel = pusherClient.subscribe("game-channel");
    channel.bind("match-found", (data: any) => {
      setMatchMaking(false);
      setPlayerOnWhite(data.white);
      setPlayerOnWhite(data.black);
      setRoomId(data.roomId);
      if (data.white === userId) setOpponentId(data.black);
      else setOpponentId(data.white);
      console.log("match found: ", data);
    });
    channel.bind("player-waiting", (data: any) => {
      console.log("player waiting: ", data);
    });
    return () => {
      pusherClient.unsubscribe("game-channel");
      channel.unbind_all();
    };
  }, []);
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
                    <h3 className="font-bold text-sm">
                      {playerOnBlack || `Computer (Black)`}
                    </h3>
                    <p className="text-xs text-foreground/70">Rating: 1800</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">00:30</div>
                </div>
              </div>
              {/* Chess Board */}
              <div className="flex flex-col gap-0 w-fit select-none">
                {/* File Labels (Top) */}
                <div className="flex gap-0 pl-10">
                  {files.map((file) => (
                    <div
                      key={file}
                      className="w-14 h-6 flex items-end justify-center text-xs font-semibold text-foreground/60 pb-1"
                    >
                      {file}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  {/* Rank Labels (Left side) */}
                  <div className="flex flex-col gap-0 pr-1">
                    {board.map((_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="w-6 h-14 flex items-center justify-end text-xs font-semibold text-foreground/60 pr-1"
                      >
                        {ranks[rowIndex]}
                      </div>
                    ))}
                  </div>

                  {/* The Board Grid */}
                  <div className="flex flex-col shadow-lg">
                    {board.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-0">
                        {row.map((square, colIndex) => {
                          const isLight = (rowIndex + colIndex) % 2 === 0;
                          const isSelected =
                            selectedSquare?.[0] === rowIndex &&
                            selectedSquare?.[1] === colIndex;
                          const isValidMove = validMoves.some(
                            (move) =>
                              move[0] === rowIndex && move[1] === colIndex,
                          );
                          const isHighlighted = selectedSquare && isValidMove;

                          // Chess.com Colors
                          const baseColorClass = isLight
                            ? "bg-[#ebecd0]"
                            : "bg-[#779556]";
                          // A specific yellow tint for selected squares that overrides base
                          const selectedClass = isSelected
                            ? "!bg-[#f5f682]"
                            : "";

                          return (
                            <button
                              key={`${rowIndex}-${colIndex}`}
                              onClick={() =>
                                handleSquareClick(rowIndex, colIndex)
                              }
                              className={`w-18 h-18 flex items-center justify-center relative outline-none ${baseColorClass} ${selectedClass} ${
                                !isSelected && isValidMove
                                  ? "cursor-pointer hover:brightness-105"
                                  : ""
                              }`}
                            >
                              {/* Valid Move Indicator (Dot for empty squares) */}
                              {isHighlighted && !square.piece && (
                                <div className="absolute w-5 h-5 bg-black/15 rounded-full" />
                              )}

                              {/* Capture Indicator (Optional ring for captures - add if desired) */}
                              {/* {isHighlighted && square.piece && (
                   <div className="absolute w-12 h-12 border-4 border-black/15 rounded-full" />
                )} */}

                              {/* The Piece */}
                              {square.piece && (
                                <div
                                  className={`relative w-[50px] h-[50px] ${isHighlighted ? "z-10" : ""}`}
                                >
                                  <Image
                                    src={`${PIECES[square.piece as keyof typeof PIECES]}`}
                                    fill
                                    sizes="50px"
                                    className="object-contain"
                                    alt={`${square.color} ${square.piece}`}
                                  />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Player Info - White */}
              <div className="bg-card border border-border rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">
                      {playerOnWhite || `You (White)`}
                    </h3>
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
      {matchMaking && (
        <VersusMatchmaking
          userAvatarUrl={session.data?.user?.image || ""}
          userName={auth.user?.username || session.data?.user?.name || "user"}
        />
        // <MatchmakingOverlay />
        // <FramerMatchmaking />
      )}
    </div>
  );
}
