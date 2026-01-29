'use server'

import { pusherServer } from "@/lib/pusher-server"
import redis from "@/lib/redis-client"
import { v4 as uuidv4 } from 'uuid';
import { Chess } from 'chess.js'

export async function triggerMatchMaking(userEmail: string) {
    const QUEUE_KEY = 'waiting-users';

    try {
        const potentialOpponent = await redis.sPop(QUEUE_KEY);

        if (potentialOpponent) {
            // Edge case: If the user somehow matched with themselves (e.g. clicked twice fast)
            if (potentialOpponent === userEmail) {
                await redis.sAdd(QUEUE_KEY, userEmail);
                return { success: true, status: 'waiting' };
            }

            // 1. Generate Room ID
            const roomId = `room_${uuidv4()}`;

            // 2. Randomly assign sides
            const isOpponentWhite = Math.random() > 0.5;
            const whitePlayer = isOpponentWhite ? potentialOpponent : userEmail;
            const blackPlayer = isOpponentWhite ? userEmail : potentialOpponent;

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

            return {
                success: true,
                status: 'matched',
                roomId,
                color: whitePlayer === userEmail ? 'w' : 'b', // Tell the requestor their color
                opponent: potentialOpponent
            };

        } else {
            // No opponent found, add to queue
            await redis.sAdd(QUEUE_KEY, userEmail);
            return { success: true, status: 'waiting' };
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

        try {
            // .move() throws an error or returns null if invalid in some versions, 
            // but standard chess.js returns the move object or null.
            const result = chess.move(move);
            if (!result) throw new Error("Invalid move");
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
            lastMove: JSON.stringify(move), // Optional: helps frontend animation
            ...(winner && { winner }) // Only add winner if game is over
        });

        // 6. Broadcast to everyone in the room
        await pusherServer.trigger(`room-${roomId}`, 'game-update', {
            fen: nextFen,
            turn: nextTurn,
            lastMove: move,
            status: nextStatus,
            winner
        });

        return { success: true };

    } catch (error) {
        console.error("Move error:", error);
        return { success: false, error: "Failed to process move" };
    }
}