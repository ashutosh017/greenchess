import Pusher from 'pusher-js'
import { env } from '@/lib/env'

let pusherClient: Pusher | null = null

export function getPusherClient() {
    if (!pusherClient) {
        pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
        })
    }
    return pusherClient
}
