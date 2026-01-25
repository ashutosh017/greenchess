
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
// import { prisma } from "./prisma"
import { PrismaAdapter } from '@auth/prisma-adapter'

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google, GitHub],
    // adapter: PrismaAdapter(prisma)
})