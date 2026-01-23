'use server'
import { pusherServer } from "@/lib/pusher-server"

export async function triggerPersonJoinEvent(userEmail: string) {
    try {
        console.log("useremail: ", userEmail)
        await pusherServer.trigger('game-channel', 'person-join', {
            msg: "user has joined",
            data: {
                userEmail
            }
        })
        return {
            success: true
        }
    } catch (error) {
        console.log("error: ", error);
        return {
            success: false
        }

    }
}