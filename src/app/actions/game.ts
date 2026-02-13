'use server'

import { pusherServer } from "@/lib/pusher-server"
import redis from "@/lib/redis-client"
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
            await redis.hSet(`game:${roomId}`, {
                white: whitePlayer,
                black: blackPlayer,
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Standard start FEN
                turn: 'w',
                status: 'active'
            });

            // 4. Notify both users via Pusher
            await pusherServer.trigger('game-channel', 'match-found', {
                roomId,
                white: whitePlayer,
                black: blackPlayer,
                msg: "Match started!"
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
        }

        // 5. Update Redis with new state
        const nextFen = chess.fen();
        const nextTurn = chess.turn(); // 'w' or 'b'

        await redis.hSet(GAME_KEY, {
            fen: nextFen,
            turn: nextTurn,
            status: nextStatus,
            lastMove: JSON.stringify(move),
            ...(winner && { winner })
        });

        // 6. Broadcast to everyone in the room (INCLUDING SAN)
        await pusherServer.trigger(`room-${roomId}`, 'game-update', {
            fen: nextFen,
            turn: nextTurn,
            lastMove: move,
            san: moveResult.san, // <--- Added this field
            status: nextStatus,
            winner
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

        return { success: true };

    } catch (error) {
        console.error("Resign error:", error);
        return { success: false, error: "Failed to resign" };
    }
}