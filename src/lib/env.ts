console.log("pusher secret inside env file: ", process.env.PUSHER_SECRET)

export const env = {
    DATABASE_URL: process.env.DATABASE_URL ?? "undefined",
    AUTH_SECRET: process.env.AUTH_SECRET ?? "undefined",
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ?? "undefined",
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ?? "undefined",
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ?? "undefined",
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ?? "undefined",
    PUSHER_APP_ID: process.env.PUSHER_APP_ID ?? "undefined",
    PUSHER_SECRET: process.env.PUSHER_SECRET ?? "undefined",
    PUSHER_KEY: process.env.PUSHER_KEY ?? "undefined",
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER ?? "undefined",


    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "undefined",
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "undefined",
}