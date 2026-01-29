import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcrypt"

import prisma from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt", // recommended for App Router
    },

    providers: [
        Google,
        GitHub,

        // CredentialsProvider({
        //     name: "Email & Password",

        //     credentials: {
        //         email: { label: "Email", type: "email" },
        //         password: { label: "Password", type: "password" },
        //     },

        //     async authorize(credentials) {
        //         if (!credentials?.email || !credentials?.password) {
        //             return null
        //         }

        //         const user = await prisma.user.findUnique({
        //             where: { email: credentials.email as unknown as string },
        //         })

        //         if (!user || !user.password) {
        //             return null
        //         }

        //         const isValid = await bcrypt.compare(
        //             credentials.password as unknown as string,
        //             user.password
        //         )

        //         if (!isValid) {
        //             return null
        //         }

        //         // IMPORTANT: return minimal safe user object
        //         return {
        //             id: user.id,
        //             email: user.email,
        //             name: user.username ?? user.name,
        //         }
        //     },
        // }),
    ],

    callbacks: {
        // This callback is called when a JWT is created (on sign in) or updated
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id; // Add the user id to the token
            }
            // If you need an access token from an OAuth provider, you can add it here too
            // if (account) { token.accessToken = account.access_token; }
            return token;
        },
        // This callback is called whenever a session is checked
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string; // Add the id from the token to the session
            }
            return session;
        },
    },
})
