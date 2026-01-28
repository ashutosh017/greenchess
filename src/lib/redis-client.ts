import { createClient } from 'redis';
import { env } from './env';

declare global {
    var redis: ReturnType<typeof createClient> | undefined
}

const redis = global.redis ?? createClient({
    username: 'default',
    password: env.REDIS_PASSWORD,
    socket: {
        host: env.REDIS_HOST,
        port: 13105
    }
});

if (!global.redis) {
    redis.on("error", (err) => console.error("Redis error", err));
    redis.connect();
    global.redis = redis;
}
export default redis;


