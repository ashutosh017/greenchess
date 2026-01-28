import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcrypt"

import prisma from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),

    // session: {
    //     strategy: "jwt", // recommended for App Router
    // },

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

    // callbacks: {
    //     async jwt({ token, user }) {
    //         if (user) {
    //             token.id = user.id
    //         }
    //         return token
    //     },

    //     async session({ session, token }) {
    //         if (session.user) {
    //             session.user.id = token.id as string
    //         }
    //         return session
    //     },
    // },
})
