import { env } from '@/lib/env';
import Pusher from 'pusher-js';

export const pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER
})