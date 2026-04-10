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
        port: env.REDIS_PORT as unknown as number,
        connectTimeout: 10000
    },

});

if (!global.redis) {
    redis.on("error", (err) => console.error(err));
    redis.connect();
    global.redis = redis;
}
export default redis;


