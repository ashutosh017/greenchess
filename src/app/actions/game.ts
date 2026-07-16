'use server'

import { pusherServer } from "@/lib/pusher-server"
import redis from "@/lib/redis-client"
import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from 'uuid';
import { Chess } from 'chess.js'
import { findUserByEmail } from "./user";
import { ApiResponse } from "@/lib/api-response";
import { User } from "@/types/user";

export type TriggerMatchMakingResponse = {
    status: "waiting"
} | {
    status: "matched"
    userAvatarUrl: string | null,
    opponentAvatarUrl: string | null,
    roomId: string,
    color: "w" | 'b',
    opponent: string

}
export async function triggerUserLeft(userId: string, roomId: string) {
    console.log("user left trigggerd")
    await pusherServer.trigger('presence-channel', 'user-left', {
        userId, roomId
    })
}
export async function triggerMatchMaking(userEmail: string): Promise<ApiResponse<TriggerMatchMakingResponse>> {
    const QUEUE_KEY = 'waiting-users';
    const user = await findUserByEmail(userEmail);
    if (user.error) {
        return {
            success: false,
            data: null,
            error: user.error
        }
    }
    if (!user.data) {
        return {
            success: false,
            data: null,
            error: "User not found"
        }
    }

    try {
        const potentialOpponent = await redis.get(QUEUE_KEY);

        let parsedPotentialOpponent: User;
        if (potentialOpponent) {
            parsedPotentialOpponent = JSON.parse(potentialOpponent)
            // Edge case: If the user somehow matched with themselves (e.g. clicked twice fast)
            if (parsedPotentialOpponent.email === userEmail) {
                console.log("same person hit the new game button twice")
                // await redis.set(QUEUE_KEY, userEmail);
                return {
                    success: true, data: {
                        status: 'waiting'
                    }
                };
            }

            // 1. Generate Room ID
            const roomId = `room_${uuidv4()}`;

            // 2. Randomly assign sides
            const isOpponentWhite = Math.random() > 0.5;
            const whitePlayer = isOpponentWhite ? parsedPotentialOpponent.email : userEmail;
            const blackPlayer = isOpponentWhite ? userEmail : parsedPotentialOpponent.email;

            // 3. IMPORTANT: Store the active game state in Redis
            // You will need this later to validate moves (e.g., ensuring White moves first)
            const now = Date.now();
            await redis.hSet(`game:${roomId}`, {
                white: whitePlayer,
                black: blackPlayer,
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Standard start FEN
                turn: 'w',
                status: 'active',
                whiteTime: '600',
                blackTime: '600',
                lastMoveAt: now.toString(),
            });

            const whiteUser = await prisma.user.findFirst({ where: { email: whitePlayer } });
            const blackUser = await prisma.user.findFirst({ where: { email: blackPlayer } });
            const whiteRating = whiteUser?.rating || 600;
            const blackRating = blackUser?.rating || 600;
            const whiteUsername = whiteUser?.username || whiteUser?.name || "Player";
            const blackUsername = blackUser?.username || blackUser?.name || "Player";

            // 4. Notify both users via Pusher
            await pusherServer.trigger('game-channel', 'match-found', {
                roomId,
                white: whitePlayer,
                black: blackPlayer,
                whiteUsername,
                blackUsername,
                whiteRating,
                blackRating,
                msg: "Match started!",
                whiteTime: 600,
                blackTime: 600,
                lastMoveAt: now,
            });

            redis.del(QUEUE_KEY)

            return {
                success: true,
                data: {
                    status: 'matched',
                    userAvatarUrl: user.data?.avatarUrl,
                    opponentAvatarUrl: parsedPotentialOpponent.avatarUrl,
                    roomId,
                    color: whitePlayer === userEmail ? 'w' : 'b', // Tell the requestor their color
                    opponent: parsedPotentialOpponent.email
                }
            };

        } else {
            // No opponent found, add to queue
            await redis.set(QUEUE_KEY, JSON.stringify(user.data));
            return {
                success: true, data: {
                    status: 'waiting'
                }
            };
        }

    } catch (error) {
        console.error("Matchmaking error:", error);
        return { success: false, error: "Failed to process matchmaking" };
    }
}

export async function handleMove(
    roomId: string,
    move: { from: string; to: string; promotion?: string },
    playerEmail: string
) {
    const GAME_KEY = `game:${roomId}`;

    try {
        // 1. Fetch current game state from Redis
        const gameState = await redis.hGetAll(GAME_KEY);

        if (!gameState || !gameState.fen) {
            return { success: false, error: "Game not found" };
        }

        // 2. Validate it's this player's turn
        const isWhite = gameState.white === playerEmail;
        const isBlack = gameState.black === playerEmail;

        if (!isWhite && !isBlack) {
            return { success: false, error: "You are not a player in this game" };
        }

        const currentTurn = gameState.turn; // 'w' or 'b' stored in Redis
        if ((isWhite && currentTurn !== 'w') || (isBlack && currentTurn !== 'b')) {
            return { success: false, error: "Not your turn" };
        }

        // Calculate time spent
        const lastMoveAt = parseInt(gameState.lastMoveAt || Date.now().toString());
        const now = Date.now();
        // Add 500ms buffer for network latency
        const elapsed = Math.floor(Math.max(0, now - lastMoveAt - 500) / 1000);

        let whiteTime = parseInt(gameState.whiteTime || '600');
        let blackTime = parseInt(gameState.blackTime || '600');

        if (currentTurn === 'w') {
            whiteTime = Math.max(0, whiteTime - elapsed);
        } else {
            blackTime = Math.max(0, blackTime - elapsed);
        }

        // 3. Validate move logic using Chess.js
        const chess = new Chess(gameState.fen);
        let moveResult;

        try {
            // Perform the move. chess.js returns the move object (with SAN) or throws/returns null
            moveResult = chess.move(move);
            if (!moveResult) throw new Error("Invalid move");
        } catch (e) {
            return { success: false, error: "Illegal move attempted" };
        }

        // 4. Check for Game Over conditions
        let nextStatus = 'active';
        let winner = null;

        if (chess.isGameOver()) {
            nextStatus = 'finished';
            if (chess.isCheckmate()) {
                winner = chess.turn() === 'w' ? 'black' : 'white'; // The side that just moved won
            } else {
                winner = 'draw'; // Stalemate, repetition, etc.
            }
            await updateRatings(roomId, winner);
        }

        // 5. Update Redis with new state
        const nextFen = chess.fen();
        const nextTurn = chess.turn(); // 'w' or 'b'

        await redis.hSet(GAME_KEY, {
            fen: nextFen,
            turn: nextTurn,
            status: nextStatus,
            lastMove: JSON.stringify(move),
            whiteTime: whiteTime.toString(),
            blackTime: blackTime.toString(),
            lastMoveAt: now.toString(),
            ...(winner && { winner })
        });

        // 6. Broadcast to everyone in the room (INCLUDING SAN and Time)
        await pusherServer.trigger(`room-${roomId}`, 'game-update', {
            fen: nextFen,
            turn: nextTurn,
            lastMove: move,
            san: moveResult.san,
            status: nextStatus,
            winner,
            whiteTime,
            blackTime,
            lastMoveAt: now,
        });

        return { success: true };

    } catch (error) {
        console.error("Move error:", error);
        return { success: false, error: "Failed to process move" };
    }
}

export async function resignGame(roomId: string, userId: string) {
    const GAME_KEY = `game:${roomId}`;

    try {
        // 1. Fetch current game
        const gameState = await redis.hGetAll(GAME_KEY);

        if (!gameState || gameState.status === 'finished') {
            return { success: false, error: "Game already finished or not found" };
        }

        // 2. Determine who is resigning and who wins
        let winner = '';
        if (gameState.white === userId) {
            winner = 'black'; // White resigned, Black wins
        } else if (gameState.black === userId) {
            winner = 'white'; // Black resigned, White wins
        } else {
            return { success: false, error: "You are not in this game" };
        }

        // 3. Update Redis
        await redis.hSet(GAME_KEY, {
            status: 'finished',
            winner: winner,
            resignation: 'true' // Optional: marker to know how game ended
        });

        // 4. Broadcast Game Over
        await pusherServer.trigger(`room-${roomId}`, 'game-update', {
            fen: gameState.fen, // Board doesn't change
            turn: gameState.turn,
            status: 'finished',
            winner: winner,
            msg: `${winner === 'white' ? 'Black' : 'White'} resigned.`
        });

        await updateRatings(roomId, winner);

        return { success: true };

    } catch (error) {
        console.error("Resign error:", error);
        return { success: false, error: "Failed to resign" };
    }
}

async function updateRatings(roomId: string, winner: string | null) {
    const GAME_KEY = `game:${roomId}`;
    try {
        const gameState = await redis.hGetAll(GAME_KEY);
        if (!gameState) return;

        // Check if ratings are already updated for this game
        if (gameState.ratingUpdated === 'true') {
            return;
        }

        const whiteEmail = gameState.white;
        const blackEmail = gameState.black;

        if (!whiteEmail || !blackEmail) return;

        if (winner === 'white') {
            await prisma.user.update({
                where: { email: whiteEmail },
                data: { rating: { increment: 10 } }
            });
            await prisma.user.update({
                where: { email: blackEmail },
                data: { rating: { decrement: 10 } }
            });
        } else if (winner === 'black') {
            await prisma.user.update({
                where: { email: blackEmail },
                data: { rating: { increment: 10 } }
            });
            await prisma.user.update({
                where: { email: whiteEmail },
                data: { rating: { decrement: 10 } }
            });
        }

        // Set the flag so we don't update multiple times
        await redis.hSet(GAME_KEY, {
            ratingUpdated: 'true'
        });
    } catch (e) {
        console.error("Error updating ratings:", e);
    }
}

export async function handleOpponentLeft(roomId: string, userId: string) {
    const GAME_KEY = `game:${roomId}`;
    try {
        const gameState = await redis.hGetAll(GAME_KEY);
        if (!gameState || gameState.status === 'finished') {
            return { success: false, error: "Game already finished or not found" };
        }

        // Determine winner: the player who did NOT leave (whose userId/email matches white or black)
        let winner: 'white' | 'black';
        if (gameState.white === userId) {
            winner = 'white';
        } else if (gameState.black === userId) {
            winner = 'black';
        } else {
            return { success: false, error: "You are not in this game" };
        }

        // Update Redis status
        await redis.hSet(GAME_KEY, {
            status: 'finished',
            winner: winner,
            opponentLeft: 'true'
        });

        // Broadcast to pusher
        await pusherServer.trigger(`room-${roomId}`, 'game-update', {
            fen: gameState.fen,
            turn: gameState.turn,
            status: 'finished',
            winner: winner,
            msg: "Opponent left the game."
        });

        // Update ratings
        await updateRatings(roomId, winner);

        return { success: true };
    } catch (error) {
        console.error("handleOpponentLeft error:", error);
        return { success: false, error: "Failed to process opponent left" };
    }
}