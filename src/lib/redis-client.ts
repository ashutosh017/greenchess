import { createClient } from 'redis';
import { env } from './env';

declare global {
    var redis: ReturnType<typeof createClient> | undefined
}

const isTls = env.REDIS_HOST !== 'localhost' && env.REDIS_HOST !== '127.0.0.1';

const redis = global.redis ?? createClient({
    username: 'default',
    password: env.REDIS_PASSWORD,
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT as unknown as number,
        connectTimeout: 10000,
        ...(isTls ? { tls: true } : {})
    },
});

if (!global.redis) {
    redis.on("error", (err) => console.error(err));
    redis.connect();
    global.redis = redis;
}
export default redis;


