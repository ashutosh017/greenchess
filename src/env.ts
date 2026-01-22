
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /*
     * Server Side: Keys that should NEVER be exposed to the browser.
     */
    server: {
        DATABASE_URL: z.string().url(), // Ensures it's a valid URL
        AUTH_SECRET: z.string().min(1),
        AUTH_GOOGLE_ID: z.string().min(1),
        AUTH_GOOGLE_SECRET: z.string().min(1),
        AUTH_GITHUB_ID: z.string().min(1),
        AUTH_GITHUB_SECRET: z.string().min(1),

        // Pusher Secrets (Server only)
        PUSHER_APP_ID: z.string().min(1),
        PUSHER_SECRET: z.string().min(1),
    },

    /*
     * Client Side: Keys needed in the browser.
     * MUST start with NEXT_PUBLIC_ to work in client components.
     */
    client: {
        // Note: You likely need to rename these in your .env file to add NEXT_PUBLIC_
        NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
        NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
    },

    /*
     * Runtime Mapping: Bridges process.env to the schema.
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
        AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
        AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,

        PUSHER_APP_ID: process.env.PUSHER_APP_ID,
        PUSHER_SECRET: process.env.PUSHER_SECRET,

        // Client-side mapping
        NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY, // Mapping old name to new NEXT_PUBLIC name
        NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    },
});