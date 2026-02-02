"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher-client";
import { handleMove, resignGame, triggerMatchMaking } from "../actions/game";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import VersusMatchmaking from "@/components/versus-matchmaking";
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

  const toChessNotation = (row: number, col: number) => {
    return `${files[col]}${ranks[row]}`;
  };
  const myColor =
    userId === playerOnWhite
      ? "white"
      : userId === playerOnBlack
        ? "black"
        : null;
  const handleSquareClick = async (row: number, col: number) => {
    const square: [number, number] = [row, col];
    if (opponentId && currentPlayer !== myColor) {
      console.log("returning");
      return;
    }
    console.log("valid moves: ", validMoves);
    if (validMoves.some((move) => move[0] === row && move[1] === col)) {
      console.log("selected squre: ", selectedSquare);
      if (selectedSquare) {
        makeMove(selectedSquare, square);
        setSelectedSquare(null);
        setValidMoves([]);
        const fromNotation = toChessNotation(
          selectedSquare[0],
          selectedSquare[1],
        );
        const toNotation = toChessNotation(row, col);
        const isPawn =
          selectedSquare &&
          board[selectedSquare[0]][selectedSquare[1]].piece
            ?.toLowerCase()
            .includes("p");
        const isPromotion = isPawn && (row === 0 || row === 7);
        try {
          await handleMove(
            roomId || "",
            {
              from: fromNotation,
              to: toNotation,
              promotion: isPromotion ? "q" : undefined,
            },
            userId || "",
          );
        } catch (error) {
          console.error("Move failed on server:", error);
        }
      }
      return;
    }
    const piece = board[row][col];
    console.log("piece: ", piece.piece);
    console.log("pice color ", piece.color);
    console.log("current plyaer:  ", currentPlayer);
    console.log("my color: ", myColor);
    if (
      (piece.piece &&
        piece.color === currentPlayer &&
        piece.color === myColor) ||
      !opponentId
    ) {
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
      console.log("got into else");
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };
  const fenToBoard = (fen: string): Board => {
    const [position] = fen.split(" ");
    const rows = position.split("/");

    return rows.map((row) => {
      const newRow: BoardPosition[] = [];

      for (const char of row) {
        if (!isNaN(Number(char))) {
          const emptyCount = Number(char);
          for (let i = 0; i < emptyCount; i++) {
            newRow.push({ piece: null, color: null });
          }
        } else {
          const isWhite = char === char.toUpperCase();
          const pieceType = char.toLowerCase();
          // const pieceCode = (isWhite ? "w" : "b") + pieceType.toUpperCase();
          const pieceCode = isWhite ? pieceType.toUpperCase() : pieceType;
          newRow.push({
            piece: pieceCode,
            color: isWhite ? "white" : "black",
          });
        }
      }
      return newRow;
    });
  };
  useEffect(() => {
    if (!roomId) return;

    const channel = pusherClient.subscribe(`room-${roomId}`);

    channel.bind("game-update", (data: any) => {
      const { fen, turn, san, status, winner } = data; // Receive 'san'

      const newBoard = fenToBoard(fen);
      setBoard(newBoard);

      const nextPlayer = turn === "w" ? "white" : "black";
      setCurrentPlayer(nextPlayer);

      if (status === "finished") {
        setGameStatus(
          `Game Over! ${winner === "draw" ? "Draw" : winner + " wins"}`,
        );
      } else {
        setGameStatus(`${nextPlayer === "white" ? "White" : "Black"} to move`);
      }

      // --- HISTORY UPDATE LOGIC ---
      if (san) {
        setMoveHistory((prev) => {
          // Check if the last move we have is the same as the incoming one
          // This prevents duplication if our optimistic UI already added it
          const lastLocalMove = prev[prev.length - 1];
          if (lastLocalMove === san) {
            return prev;
          }
          return [...prev, san];
        });
      }

      // We DON'T clear selectedSquare here usually, otherwise it flickers
      // if you select a piece fast while an opponent moves.
      // But clearing validMoves is safe.
      setValidMoves([]);
    });

    return () => pusherClient.unsubscribe(`room-${roomId}`);
  }, [roomId]);
  const makeMove = (from: [number, number], to: [number, number]) => {
    const newBoard = board.map((row) => [...row]);
    const piece = newBoard[from[0]][from[1]];
    const target = newBoard[to[0]][to[1]];

    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = { piece: null, color: null };

    // --- NOTATION GENERATION ---
    const toSquare = files[to[1]] + ranks[to[0]];

    // 1. Get raw piece char (e.g., 'wP' -> 'P', 'bN' -> 'N')
    const rawPieceChar = piece.piece ? piece.piece.substring(1) : "";

    // 2. Standard Notation rules:
    // - Don't show 'P' for pawns
    // - Show 'x' if capture
    const isCapture = target.piece !== null;
    const pieceChar =
      rawPieceChar === "P" ? (isCapture ? files[from[1]] : "") : rawPieceChar;

    // const moveNotation = `${pieceChar}${isCapture ? "x" : ""}${toSquare}`;
    // ---------------------------

    setBoard(newBoard);
    // setMoveHistory([...moveHistory, moveNotation]); // Add clean notation
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
    if (!userId) return;
    triggerMatchMaking(userId);
    setMatchMaking(true);
  };
  useEffect(() => {
    if (!auth.user && session.status === "unauthenticated") return;
    const userEmail = auth.user?.email || session.data?.user?.email;
    if (!userEmail) return;
    setUserId(userEmail);
  }, [auth, session]);
  useEffect(() => {
    // 1. Guard clause: Don't subscribe until we know who the user is
    if (!userId) return;

    const channel = pusherClient.subscribe("game-channel");

    channel.bind("match-found", (data: any) => {
      // Now 'userId' inside here will be the current, correct value
      console.log("Current userId:", userId);

      // Delay hiding the matchmaking screen so users see the "Match Found" animation
      setTimeout(() => {
        setMatchMaking(false);
      }, 3000); // Reduced to 3s (8s is very long for a UI delay)

      setPlayerOnWhite(data.white);
      setPlayerOnBlack(data.black);
      setRoomId(data.roomId);

      // This logic will now work correctly
      if (data.white === userId) {
        setOpponentId(data.black);
      } else {
        setOpponentId(data.white);
      }
    });

    return () => {
      pusherClient.unsubscribe("game-channel");
      channel.unbind("match-found"); // Unbind specific event is cleaner
    };
  }, [userId]); // <--- CRITICAL: Add userId here
  const handleResign = async () => {
    if (!roomId || !userId) return;

    // Optional: Add a confirmation dialog
    if (!confirm("Are you sure you want to resign?")) return;

    try {
      await resignGame(roomId, userId);
      // No need to manually update state here;
      // the Pusher 'game-update' listener will handle the "Game Over" UI.
    } catch (error) {
      console.error("Resign failed:", error);
    }
  };
  const isFlipped = myColor === "black";
  const renderRows = isFlipped ? [...board].reverse() : board;
  const renderRanks = isFlipped ? [...ranks].reverse() : ranks;
  const renderFiles = files;
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Play Chess</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="lg:p-6 md:p-3 p-1">
              {/* Player Info - Opponent */}
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
                <div className="flex gap-0 lg:pl-10 md:pl-5 pl-1">
                  {renderFiles.map((file) => (
                    <div
                      key={file}
                      className="lg:w-18 md:w-14 w-10 md:h-6 h-3 flex items-end justify-center text-xs font-semibold text-foreground/60 pb-1"
                    >
                      {file}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  {/* Rank Labels (Left side) */}
                  <div className="flex flex-col gap-0 pr-1">
                    {renderRanks.map((_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="md:w-6 w-3 lg:h-18 md:h-14 h-10 flex items-center justify-end text-xs font-semibold text-foreground/60 pr-1"
                      >
                        {renderRanks[rowIndex]}
                      </div>
                    ))}
                  </div>

                  {/* The Board Grid */}
                  <div className="flex flex-col shadow-lg">
                    {renderRows.map((row, rowIndex) => {
                      // console.log("render rows: ", renderRows);
                      // 1. Calculate the REAL array index based on flip state
                      // If flipped, visual row 0 is actually logical row 7
                      const actualRow = isFlipped ? 7 - rowIndex : rowIndex;
                      // const actualRow = rowIndex;

                      return (
                        <div key={rowIndex} className="flex gap-0">
                          {row.map((square, colIndex) => {
                            // 1. Calculate REAL column index
                            // const actualCol = isFlipped
                            //   ? 7 - colIndex
                            //   : colIndex;
                            const actualCol = colIndex;

                            // 2. Use ACTUAL coordinates for logic checks
                            const isSelected =
                              selectedSquare?.[0] === actualRow &&
                              selectedSquare?.[1] === actualCol;

                            const isValidMove = validMoves.some(
                              (move) =>
                                move[0] === actualRow && move[1] === actualCol,
                            );

                            // 3. Visual coloring (Parity works the same for visual or logical, usually)
                            const isLight = (actualRow + actualCol) % 2 === 0;

                            const isHighlighted = selectedSquare && isValidMove;

                            // Chess.com Colors
                            const baseColorClass = isLight
                              ? "bg-[#ebecd0]"
                              : "bg-[#779556]";

                            const selectedClass = isSelected
                              ? "!bg-[#f5f682]"
                              : "";

                            return (
                              <button
                                // Use actual coords for unique key to prevent React render bugs
                                key={`${actualRow}-${actualCol}`}
                                // 4. CRITICAL: Pass ACTUAL coordinates to the handler
                                onClick={() => {
                                  console.log(
                                    "clicked: ",
                                    actualRow,
                                    actualCol,
                                  );
                                  handleSquareClick(actualRow, actualCol);
                                }}
                                className={`w-10 h-10 md:w-14 md:h-14 lg:w-18 lg:h-18 flex items-center justify-center relative outline-none ${baseColorClass} ${selectedClass} ${
                                  !isSelected && isValidMove
                                    ? "cursor-pointer hover:brightness-105"
                                    : ""
                                }`}
                              >
                                {/* Valid Move Indicator */}
                                {isValidMove && !square.piece && (
                                  <div className="absolute w-5 h-5 bg-black/15 rounded-full" />
                                )}

                                {/* The Piece */}
                                {square.piece && (
                                  <div
                                    className={`relative w-[50] h-[50] ${
                                      // If this piece is being captured (isHighlighted),
                                      // keep it below the highlight dot? Or remove dot?
                                      // Usually capture moves get a ring or corners,
                                      // but for now z-10 ensures piece is above background.
                                      isHighlighted ? "z-10" : ""
                                    }`}
                                  >
                                    {/* Move indicator ON TOP of piece for captures (Standard Chess.com style uses corners, but this works) */}
                                    {isValidMove && (
                                      <div className="absolute inset-0 bg-transparent border-[6px] border-black/10 rounded-full z-20" />
                                    )}

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
                      );
                    })}
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
                  <Button
                    variant="outline"
                    className="w-full bg-transparent hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 transition-colors"
                    onClick={handleResign}
                    disabled={gameStatus.includes("Game Over")} // Disable if game is already over
                  >
                    Resign
                  </Button>
                </div>
              </div>
            </Card>

            {/* Move History */}
            {/* Move History */}
            <Card className="flex flex-col h-full max-h-[400]">
              <div className="p-3 border-b border-border bg-muted/20">
                <h3 className="font-bold text-sm">Move History</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-0">
                {/* Table Header */}
                <div className="grid grid-cols-[3rem_1fr_1fr] text-xs font-semibold text-muted-foreground bg-muted/50 py-1 px-2">
                  <div className="pl-2">#</div>
                  <div>White</div>
                  <div>Black</div>
                </div>

                {/* Moves List */}
                <div className="flex flex-col">
                  {moveHistory.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-xs italic">
                      Game hasn't started
                    </div>
                  ) : (
                    // We create an array of "pairs" based on history length
                    Array.from({
                      length: Math.ceil(moveHistory.length / 2),
                    }).map((_, i) => {
                      const whiteMove = moveHistory[i * 2];
                      const blackMove = moveHistory[i * 2 + 1];

                      return (
                        <div
                          key={i}
                          className={`grid grid-cols-[3rem_1fr_1fr] text-sm py-1 px-2 border-b border-border/50 ${
                            (i + 1) % 2 === 0 ? "bg-muted/10" : "" // Zebra striping
                          }`}
                        >
                          {/* Move Number */}
                          <div className="text-muted-foreground font-mono pl-2 bg-muted/20 mr-2 flex items-center justify-center text-xs">
                            {i + 1}.
                          </div>

                          {/* White Move */}
                          <div className="flex items-center px-2 font-medium cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors">
                            {whiteMove}
                          </div>

                          {/* Black Move (might be undefined if it's White's turn) */}
                          <div className="flex items-center px-2 font-medium cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors">
                            {blackMove || ""}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Anchor to auto-scroll to bottom */}
                  <div id="history-end" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      {matchMaking && (
        <VersusMatchmaking
          userAvatarUrl={session.data?.user?.image || ""}
          userName={auth.user?.username || session.data?.user?.name || "user"}
          opponent={opponentId}
        />
      )}
    </div>
  );
}
