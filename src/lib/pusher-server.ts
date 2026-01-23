import Pusher from 'pusher'
import { env } from './env'

declare global {
    var pusherServer: Pusher | undefined
}

export const pusherServer = global.pusherServer || new Pusher({
    appId: env.PUSHER_APP_ID,
    cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
    key: env.NEXT_PUBLIC_PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    useTLS: true,
})


if (process.env.NODE_ENV !== 'production') {
    global.pusherServer = pusherServer
}