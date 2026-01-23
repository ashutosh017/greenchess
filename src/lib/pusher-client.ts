import { env } from '@/lib/env';
import Pusher from 'pusher-js';

export const pusherclient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER
})