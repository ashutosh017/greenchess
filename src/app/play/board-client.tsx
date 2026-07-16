"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  handleMove,
  resignGame,
  triggerMatchMaking,
  triggerUserLeft,
  handleOpponentLeft,
} from "../actions/game";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import { findUserByEmail } from "../actions/user";
import Image from "next/image";
import VersusMatchmaking from "@/components/versus-matchmaking";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Swords, AlertTriangle } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import ChessClock from "@/components/chess-clock-props";
import { getAuthenticatedUser } from "../actions/auth";
import VictoryModal from "@/components/victory-modal";

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

const isValidMoveBasic = (
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

const isKingInCheck = (board: Board, color: "white" | "black"): boolean => {
  let kingRow = -1;
  let kingCol = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p.piece?.toLowerCase() === "k" && p.color === color) {
        kingRow = r;
        kingCol = c;
        break;
      }
    }
    if (kingRow !== -1) break;
  }
  if (kingRow === -1) return false;

  const opponentColor = color === "white" ? "black" : "white";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p.piece && p.color === opponentColor) {
        if (isValidMoveBasic(board, [r, c], [kingRow, kingCol])) {
          return true;
        }
      }
    }
  }
  return false;
};

const isValidMove = (
  board: Board,
  from: [number, number],
  to: [number, number],
): boolean => {
  if (!isValidMoveBasic(board, from, to)) return false;

  // Simulate move on copy
  const boardCopy = board.map((row) =>
    row.map((cell) => ({ ...cell })),
  );
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  const movingPiece = boardCopy[fromRow][fromCol];
  boardCopy[toRow][toCol] = {
    piece: movingPiece.piece,
    color: movingPiece.color,
  };
  boardCopy[fromRow][fromCol] = {
    piece: null,
    color: null,
  };

  const myColor = movingPiece.color;
  if (!myColor) return false;

  return !isKingInCheck(boardCopy, myColor);
};

export default function BoardClient() {
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
  const [showWinningModal, setShowWinningModal] = useState<boolean>(false);
  const [showResignConfirm, setShowResignConfirm] = useState<boolean>(false);
  const [myRating, setMyRating] = useState<number>(600);
  const [opponentRating, setOpponentRating] = useState<number>(600);
  const [myUsername, setMyUsername] = useState<string>("You");
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [playerOnWhite, setPlayerOnWhite] = useState<string | null>(null);
  const [playerOnBlack, setPlayerOnBlack] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [opponentAvatarUrl, setOpponentAvatarUrl] = useState<string | null>(
    null,
  );
  // const [myLastMoveAt, setMyLastMoveAt] = useState<Date>(new Date());
  // const [opponentLastMoveAt, setOpponentLastMoveAt] = useState<Date>(
  //   new Date(),
  // );
  const [lastMoveAt, setLastMoveAt] = useState<number>(Date.now());
  const [myTime, setMyTime] = useState<number>(600);
  const [opponentTime, setOpponentTime] = useState<number>(600);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const toChessNotation = (row: number, col: number) => {
    return `${files[col]}${ranks[row]}`;
  };
  const myColor =
    userId && userId === playerOnWhite
      ? "white"
      : userId && userId === playerOnBlack
        ? "black"
        : null;
  const handleSquareClick = async (row: number, col: number) => {
    // Only allow making moves if we are in an active match
    if (!opponentId || gameStatus.includes("Game Over")) {
      return;
    }
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
      (!opponentId && piece.color === currentPlayer)
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

  const makeMove = (from: [number, number], to: [number, number]) => {
    const newBoard = board.map((row) => [...row]);
    const piece = newBoard[from[0]][from[1]];
    const target = newBoard[to[0]][to[1]];

    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = { piece: null, color: null };

    setBoard(newBoard);

    // Calculate elapsed time locally to update the "initial" time for the clock
    const now = Date.now();
    const elapsed = Math.floor((now - lastMoveAt) / 1000);

    if (currentPlayer === (myColor === "black" ? "black" : "white")) {
      setMyTime((prev) => Math.max(0, prev - elapsed));
    } else {
      setOpponentTime((prev) => Math.max(0, prev - elapsed));
    }

    setCurrentPlayer(currentPlayer === "white" ? "black" : "white");

    // Optimistically update lastMoveAt to current time to keep clocks in sync locally
    setLastMoveAt(now);

    setGameStatus(`${currentPlayer === "white" ? "Black" : "White"} to move`);
    setSelectedSquare(null);
    setValidMoves([]);
  };
  const resetBoard = async () => {
    setOpponentId(null);
    setOpponentAvatarUrl(null);
    setMyUsername("You");
    setOpponentUsername(null);
    setMatchMaking(true);
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer("white");
    setMoveHistory([]);
    setGameStatus("White to move");
    if (!userId) return;
    const resp = await triggerMatchMaking(userId);
    if (resp.success && resp.data.status === "matched") {
      setUserAvatarUrl(resp.data.userAvatarUrl);
      setOpponentAvatarUrl(resp.data.opponentAvatarUrl);
    }
  };
  const clearGameSession = () => {
    setOpponentId(null);
    setOpponentAvatarUrl(null);
    setMyUsername("You");
    setOpponentUsername(null);
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer("white");
    setMoveHistory([]);
    setGameStatus("White to move");
    setShowWinningModal(false);
    setRoomId(null);
  };

  useEffect(() => {
    if (!roomId) return;
    const pusherClient = getPusherClient();

    const channel = pusherClient.subscribe(`room-${roomId}`);
    const presenceChannel = pusherClient.subscribe(
      `presence-channel-${roomId}`,
    );
    presenceChannel.bind("pusher:member_removed", async (data: any) => {
      console.log("parsed data: ", data);
      setMyTime(600);
      setOpponentTime(600);

      setGameStatus(
        `Game Over! ${["black", "white"][myColor !== "white" ? 0 : 1]} wins!`,
      );
      setShowWinningModal(true);

      // Call handleOpponentLeft server action to update ratings
      if (roomId && userId) {
        try {
          await handleOpponentLeft(roomId, userId);
          setMyRating((prev) => prev + 10);
          setOpponentRating((prev) => Math.max(0, prev - 10));
        } catch (e) {
          console.error("Failed to notify server of opponent leaving:", e);
        }
      }
    });

    channel.bind("game-update", (data: any) => {
      console.log("game update triggered");
      const {
        fen,
        turn,
        san,
        status,
        winner,
        whiteTime,
        blackTime,
        lastMoveAt: serverLastMoveAt,
      } = data;
      if (fen) {
        const newBoard = fenToBoard(fen);
        setBoard(newBoard);
      }

      let nextPlayer = currentPlayer;
      if (turn) {
        nextPlayer = turn === "w" ? "white" : "black";
        setCurrentPlayer(nextPlayer);
      }

      if (whiteTime !== undefined && blackTime !== undefined) {
        if (myColor === "black") {
          setMyTime(blackTime);
          setOpponentTime(whiteTime);
        } else {
          // white or spectator
          setMyTime(whiteTime);
          setOpponentTime(blackTime);
        }
      }

      setLastMoveAt(Date.now());

      if (status === "finished") {
        setGameStatus(
          `Game Over! ${winner === "draw" ? "Draw" : winner + " wins"}`,
        );
        if (winner === myColor) {
          setShowWinningModal(true);
          setMyRating((prev) => prev + 10);
          setOpponentRating((prev) => Math.max(0, prev - 10));
        } else if (winner && winner !== "draw") {
          setMyRating((prev) => Math.max(0, prev - 10));
          setOpponentRating((prev) => prev + 10);
        }
      } else {
        setGameStatus(`${nextPlayer === "white" ? "White" : "Black"} to move`);
      }

      if (san) {
        setMoveHistory((prev) => {
          const lastLocalMove = prev[prev.length - 1];
          if (lastLocalMove === san) {
            return prev;
          }
          return [...prev, san];
        });
      }
      setValidMoves([]);
    });

    return () => pusherClient.unsubscribe(`room-${roomId}`);
  }, [roomId, myColor]);

  useEffect(() => {
    if (!auth.user && session.status === "unauthenticated") {
      return;
    }
    console.log("auth user: ", auth.user);
    console.log("session status: ", session.status);
    const user = auth.user || session.data?.user;
    const userEmail = user?.email;
    if (!user) return;
    // @ts-ignore
    const userAvatarUrl = user.image || user.userAvatarUrl;
    if (!userEmail) return;
    setUserId(userEmail);
    setUserAvatarUrl(userAvatarUrl);
    // @ts-ignore
    if (user.username) {
      // @ts-ignore
      setMyUsername(user.username);
    } else if (user.name) {
      setMyUsername(user.name);
    }
    // @ts-ignore
    if (user.rating) {
      // @ts-ignore
      setMyRating(user.rating);
    }
  }, [auth, session]);
  useEffect(() => {
    if (!userId) return;
    async function fetchUserRating() {
      try {
        if (!userId) return;
        const res = await findUserByEmail(userId);
        if (res.success && res.data) {
          if (res.data.rating) {
            setMyRating(res.data.rating);
          }
          if (res.data.username) {
            setMyUsername(res.data.username);
          } else if (res.data.name) {
            setMyUsername(res.data.name);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user rating:", e);
      }
    }
    fetchUserRating();
  }, [userId]);
  useEffect(() => {
    if (!userId) return;
    const pusherClient = getPusherClient();

    const channel = pusherClient.subscribe("game-channel");

    channel.bind("match-found", (data: any) => {
      console.log("Current userId:", userId);
      setTimeout(() => {
        setMatchMaking(false);
        setLastMoveAt(Date.now());
      }, 3000);

      setPlayerOnWhite(data.white);
      setPlayerOnBlack(data.black);
      setRoomId(data.roomId);

      if (data.white === userId) {
        setMyTime(data.whiteTime || 600);
        setOpponentTime(data.blackTime || 600);
        setMyRating(data.whiteRating || 600);
        setOpponentRating(data.blackRating || 600);
        setMyUsername(data.whiteUsername || "Player");
        setOpponentUsername(data.blackUsername || "Player");
      } else {
        setMyTime(data.blackTime || 600);
        setOpponentTime(data.whiteTime || 600);
        setMyRating(data.blackRating || 600);
        setOpponentRating(data.whiteRating || 600);
        setMyUsername(data.blackUsername || "Player");
        setOpponentUsername(data.whiteUsername || "Player");
      }

      setLastMoveAt(Date.now());

      if (data.white === userId) {
        setOpponentId(data.black);
      } else {
        setOpponentId(data.white);
      }
    });
  }, [userId]);
  const handleResign = async () => {
    setShowResignConfirm(true);
  };
  const confirmResign = async () => {
    if (!roomId || !userId) return;
    try {
      await resignGame(roomId, userId);
      setShowResignConfirm(false);
    } catch (error) {
      console.error("Resign failed:", error);
    }
  };
  const getGameStats = (currentBoard: Board) => {
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const pieces = Object.entries(PIECES).map((piece, index) => {
      return piece;
    });
    const remainingWhite = [];
    const remainingBlack = [];
    const pieceCount: Record<string, number> = {};
    pieces.forEach((p) => (pieceCount[p[0]] = 0));
    currentBoard.flat().forEach((cell) => {
      if (cell.color === "white") remainingWhite.push(cell.piece);
      if (cell.color === "black") remainingBlack.push(cell.piece);
      if (cell.piece) pieceCount[cell.piece]++;
    });
    const capturedWhite: string[] = [];
    const capturedBlack: string[] = [];
    const advantage = 0;
    const isUpperCase = (val: string) => val === val.toUpperCase();
    Array.from(Object.entries(pieceCount)).forEach((pc) => {
      let missingPieces: string[] = [];
      switch (pc[0].toLowerCase()) {
        case "p":
          if (pc[1] < 8)
            missingPieces.push(...new Array(8 - pc[1]).fill("p", 0, 8 - pc[1]));
          break;
        case "q":
          if (pc[1] < 1) missingPieces.push(pc[0]);
          break;
        case "k":
          if (pc[1] < 1) missingPieces.push(pc[0]);
          break;
        default:
          if (pc[1] < 2) missingPieces.push(pc[0]);
      }
      if (missingPieces) {
        if (isUpperCase(pc[0])) capturedWhite.push(...missingPieces);
        else capturedBlack.push(...missingPieces);
      }
    });

    return {
      capturedWhite,
      capturedBlack,
      advantage: 0,
    };
  };
  const isFlipped = myColor === "black";
  const renderRows = isFlipped ? [...board].reverse() : board;
  const renderRanks = isFlipped ? [...ranks].reverse() : ranks;
  const renderFiles = files;
  const { capturedWhite, capturedBlack, advantage } = getGameStats(board);
  console.log("captured black: ", capturedBlack);
  console.log("captured white ", capturedWhite);
  console.log("advantage: ", advantage);
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-background text-foreground relative overflow-x-hidden font-sans pb-12">
      {/* ================= BACKGROUND LAYERS ================= */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            conic-gradient(
              from 0deg at 50% 50%,
              rgba(128, 128, 128, 0.03) 0deg 90deg,
              transparent 90deg 180deg,
              rgba(128, 128, 128, 0.03) 180deg 270deg,
              transparent 270deg 360deg
            )
          `,
          backgroundSize: "120px 120px",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-background via-transparent to-background opacity-85 pointer-events-none"></div>
      <div className="fixed inset-0 z-[1] bg-gradient-to-r from-background via-transparent to-background opacity-85 pointer-events-none"></div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
              Live Chess Arena
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {!opponentId ? "Join matchmaking to start a live game." : "Match in progress."}
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Chess Board Area */}
          <div className="lg:col-span-3">
            <Card className="p-4 md:p-6 border border-border bg-card/60 backdrop-blur-md shadow-2xl relative flex flex-col items-center">
              
              {/* Opponent Info */}
              <div className="flex items-center justify-between w-full max-w-[450px] md:max-w-full pb-4 px-1 font-sans border-b border-border/40 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden border border-border shrink-0 shadow-sm">
                    {opponentAvatarUrl ? (
                      <img
                        src={opponentAvatarUrl}
                        alt="Opponent Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <User className="text-zinc-500 h-5 w-5" />
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-bold text-[14px] leading-tight text-foreground truncate max-w-[120px] sm:max-w-[160px]">
                        {opponentUsername || "Opponent"}
                      </h3>
                      <span className="text-[12px] text-primary/80 font-bold shrink-0 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {opponentRating}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <CapturedPieces pieces={capturedWhite} color="w" />
                      {advantage < 0 && (
                        <span className="text-[10px] font-extrabold text-emerald-500 ml-1">
                          +{Math.abs(advantage)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {opponentId && !gameStatus.includes("Game Over") && (
                  <ChessClock
                    initialTimeInSeconds={opponentTime}
                    lastMoveAt={lastMoveAt}
                    isActive={!matchMaking && currentPlayer === (isFlipped ? "white" : "black")}
                  />
                )}
              </div>

              {/* Chess Board Grid & Labels */}
              <div className="flex flex-col gap-0 select-none items-center w-full">
                {/* File Labels (Top) */}
                <div className="hidden md:flex gap-0 pl-6">
                  {renderFiles.map((file) => (
                    <div
                      key={file}
                      className="lg:w-18 md:w-14 w-10 md:h-6 h-3 flex items-end justify-center text-xs font-bold text-zinc-500 pb-1.5"
                    >
                      {file}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  {/* Rank Labels (Left side) */}
                  <div className="hidden md:flex flex-col gap-0 pr-1.5">
                    {renderRanks.map((_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="md:w-6 w-3 lg:h-18 md:h-14 h-10 flex items-center justify-end text-xs font-bold text-zinc-500"
                      >
                        {renderRanks[rowIndex]}
                      </div>
                    ))}
                  </div>

                  {/* The Board Grid */}
                  <div
                    className={`flex flex-col shadow-2xl rounded-xl overflow-hidden border border-zinc-800/80 ${!opponentId || gameStatus.includes("Game Over") ? "pointer-events-none opacity-90" : ""}`}
                  >
                    {renderRows.map((row, rowIndex) => {
                      const actualRow = isFlipped ? 7 - rowIndex : rowIndex;

                      return (
                        <div key={rowIndex} className="flex gap-0">
                          {row.map((square, colIndex) => {
                            const actualCol = colIndex;

                            const isSelected =
                              selectedSquare?.[0] === actualRow &&
                              selectedSquare?.[1] === actualCol;

                            const isValidMove = validMoves.some(
                              (move) =>
                                move[0] === actualRow && move[1] === actualCol,
                            );

                            const isLight = (actualRow + actualCol) % 2 === 0;
                            const isHighlighted = selectedSquare && isValidMove;

                            // Keep the Board Colors Exact
                            const baseColorClass = isLight
                              ? "bg-[#ebecd0]"
                              : "bg-[#779556]";

                            const selectedClass = isSelected
                              ? "!bg-[#f5f682]"
                              : "";

                            return (
                              <button
                                key={`${actualRow}-${actualCol}`}
                                onClick={() => {
                                  console.log("clicked: ", actualRow, actualCol);
                                  handleSquareClick(actualRow, actualCol);
                                }}
                                className={`w-10 h-10 md:w-14 md:h-14 lg:w-18 lg:h-18 flex items-center justify-center relative outline-none ${baseColorClass} ${selectedClass} ${
                                  !isSelected && isValidMove
                                    ? "cursor-pointer hover:brightness-105"
                                    : ""
                                  }`}
                              >
                                {isValidMove && !square.piece && (
                                  <div className="absolute w-5 h-5 bg-black/15 rounded-full" />
                                )}

                                {square.piece && (
                                  <div className={`relative w-[50] h-[50] ${isHighlighted ? "z-10" : ""}`}>
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
              <div className="flex items-center justify-between w-full max-w-[450px] md:max-w-full pt-4 px-1 font-sans border-t border-border/40 mt-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden border border-border shrink-0 shadow-sm">
                    {userAvatarUrl ? (
                      <img
                        src={userAvatarUrl}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <User className="text-zinc-500 h-5 w-5" />
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-bold text-[14px] leading-tight text-foreground truncate max-w-[120px] sm:max-w-[160px]">
                        {myUsername}
                      </h3>
                      <span className="text-[12px] text-primary/80 font-bold shrink-0 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {myRating}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <CapturedPieces pieces={capturedBlack} color="b" />
                      {advantage > 0 && (
                        <span className="text-[10px] font-extrabold text-emerald-500 ml-1">
                          +{advantage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {opponentId && !gameStatus.includes("Game Over") && (
                  <ChessClock
                    initialTimeInSeconds={myTime}
                    lastMoveAt={lastMoveAt}
                    isActive={!matchMaking && currentPlayer === (isFlipped ? "black" : "white")}
                  />
                )}
              </div>

            </Card>
          </div>

          {/* Right Side: Game Info / Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Status / Controls card */}
            <Card className="p-6 border border-border bg-card/60 backdrop-blur-md shadow-xl">
              <h3 className="font-extrabold text-lg tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                Match Info
              </h3>
              
              <div className="space-y-4">
                {opponentId && (
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
                      Current Turn
                    </p>
                    <p className="text-base font-extrabold text-primary">
                      {gameStatus}
                    </p>
                  </div>
                )}

                {opponentId && (
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
                      Total Moves
                    </p>
                    <p className="text-xl font-black text-foreground">
                      {moveHistory.length}
                    </p>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  {!opponentId ? (
                    <Button
                      onClick={resetBoard}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <Swords className="mr-2 h-5 w-5" />
                      Find Match
                    </Button>
                  ) : (
                    <Button
                      onClick={resetBoard}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-foreground font-black py-5 rounded-xl border border-border hover:-translate-y-0.5 transition-all duration-200"
                    >
                      New Match
                    </Button>
                  )}

                  {opponentId && !gameStatus.includes("Game Over") && (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 font-bold py-5 rounded-xl transition-all"
                      onClick={handleResign}
                    >
                      Resign
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Move History card */}
            {opponentId && (
              <Card className="flex flex-col max-h-[350px] border border-border bg-card/60 backdrop-blur-md shadow-xl overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20">
                  <h3 className="font-extrabold text-sm tracking-tight">Move History</h3>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Table Header */}
                  <div className="grid grid-cols-[3rem_1fr_1fr] text-xs font-bold uppercase tracking-wider text-zinc-500 bg-muted/40 py-2 px-3 border-b border-border/40">
                    <div className="pl-1">#</div>
                    <div>White</div>
                    <div>Black</div>
                  </div>

                  {/* Moves List */}
                  <div className="flex flex-col divide-y divide-border/20">
                    {moveHistory.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-xs italic">
                        Game started. Waiting for first move...
                      </div>
                    ) : (
                      Array.from({
                        length: Math.ceil(moveHistory.length / 2),
                      }).map((_, i) => {
                        const whiteMove = moveHistory[i * 2];
                        const blackMove = moveHistory[i * 2 + 1];

                        return (
                          <div
                            key={i}
                            className={`grid grid-cols-[3rem_1fr_1fr] text-sm py-2.5 px-3 items-center hover:bg-muted/10 transition-colors duration-150 ${
                              (i + 1) % 2 === 0 ? "bg-muted/5" : ""
                            }`}
                          >
                            <div className="text-zinc-500 font-mono text-xs pl-1">
                              {i + 1}.
                            </div>

                            <div className="font-semibold text-foreground">
                              {whiteMove}
                            </div>

                            <div className="font-semibold text-foreground">
                              {blackMove || ""}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div id="history-end" />
                  </div>
                </div>
              </Card>
            )}

          </div>
        </div>
      </main>
      {matchMaking && (
        <VersusMatchmaking
          userAvatarUrl={userAvatarUrl}
          userName={auth.user?.username || session.data?.user?.name || "user"}
          userRating={myRating}
          opponent={opponentUsername}
          opponentAvatarUrl={opponentAvatarUrl}
          onCancel={() => setMatchMaking(false)}
        />
      )}
      <VictoryModal
        isOpen={showWinningModal}
        onClose={() => setShowWinningModal(false)}
        onNewGame={resetBoard}
        opponentName={opponentUsername}
        myColor={myColor}
      />
      {showResignConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 border border-border bg-card/90 backdrop-blur-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Confirm Resignation
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Are you sure you want to resign? This will count as a loss and deduct 10 ELO points.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl py-5 font-bold transition-all"
                onClick={() => setShowResignConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-5 rounded-xl shadow-lg shadow-red-600/20 transition-all"
                onClick={confirmResign}
              >
                Yes, Resign
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

const CapturedPieces = ({
  pieces,
  color,
}: {
  pieces: string[];
  color: "w" | "b";
}) => {
  // Sort pieces by value
  const scoreMap: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const sortedPieces = [...pieces].sort((a, b) => scoreMap[a] - scoreMap[b]);

  // Map piece codes to their visual representation (SVG or Unicode)
  const pieceTheme: Record<string, string> = {
    p: color === "w" ? "♟" : "♙",
    n: color === "w" ? "♞" : "♘",
    b: color === "w" ? "♝" : "♗",
    r: color === "w" ? "♜" : "♖",
    q: color === "w" ? "♛" : "♕",
  };

  return (
    <div className="flex items-center h-4 gap-[-2px] opacity-80">
      {sortedPieces.map((p, i) => (
        <span
          key={i}
          className="text-sm transition-all hover:translate-y-[-2]"
          style={{
            marginLeft: i > 0 && p === sortedPieces[i - 1] ? "-4px" : "2px",
          }}
        >
          {pieceTheme[p]}
        </span>
      ))}
    </div>
  );
};
