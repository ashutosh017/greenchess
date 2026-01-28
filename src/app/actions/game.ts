'use server'

import { pusherServer } from "@/lib/pusher-server"
import redis from "@/lib/redis-client"
import { v4 as uuidv4 } from 'uuid'; // Optional: Use this or Date.now() for unique IDs

export async function triggerMatchMaking(userEmail: string) {
    const QUEUE_KEY = 'waiting-users';

    try {
        console.log("Attempting matchmaking for:", userEmail);
        const potentialOpponent = await redis.sPop(QUEUE_KEY);

        if (potentialOpponent) {

            if (potentialOpponent === userEmail) {
                await redis.sAdd(QUEUE_KEY, userEmail); // Put them back
                return { success: true, status: 'waiting' };
            }

            const roomId = `room_${uuidv4()}`;

            await pusherServer.trigger('game-channel', 'match-found', {
                roomId,
                player1: potentialOpponent,
                player2: userEmail,
                msg: "Match started!"
            });

            console.log(`Match created: ${potentialOpponent} vs ${userEmail} in ${roomId}`);

            return {
                success: true,
                status: 'matched',
                roomId,
                opponent: potentialOpponent
            };

        } else {
            await redis.sAdd(QUEUE_KEY, userEmail);

            await pusherServer.trigger('game-channel', 'player-waiting', {
                userEmail,
                msg: "User added to queue"
            });

            console.log("User added to waitlist:", userEmail);

            return {
                success: true,
                status: 'waiting'
            };
        }

    } catch (error) {
        console.error("Matchmaking error:", error);
        return {
            success: false,
            error: "Failed to process matchmaking"
        };
    }
}