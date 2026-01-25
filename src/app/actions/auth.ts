'use server'

import { SignJWT } from 'jose'
import { cookies } from "next/headers"
import bcrypt from 'bcrypt'
import { env } from "@/lib/env"
import { ApiResponse } from "@/lib/api-response"
import prisma from '@/lib/prisma'

export async function signin(prevState: any, formData: FormData): Promise<ApiResponse<{ token: string }>> {

    try {
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            return { success: false, error: "Invalid email or password" }
        }

        // 2. Verify Password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return { success: false, error: "Invalid email or password" }
        }

        // 3. Create JWT Token using 'jose'
        const secret = new TextEncoder().encode(env.AUTH_SECRET)
        const token = await new SignJWT({
            userId: user.id,
            email: user.email
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d') // Token expires in 24 hours
            .sign(secret)

        // 4. Set the Cookie
        const cookieStore = await cookies()
        cookieStore.set("auth_token", token, {
            httpOnly: true,    // Prevents JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 60 * 60 * 24,
            path: "/",
        })

        return { success: true, data: { token } }
    } catch (error) {
        console.error("Signin Error:", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}


export async function signup(prevState: any, formData: FormData): Promise<ApiResponse<{ token: string }>> {
    try {
        const username = formData.get("username") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const name = formData.get("name") as string
        const country = formData.get("country") as string || "Unknown"

        console.log(username)
        console.log(email)
        console.log(password)
        console.log(name)
        console.log(country)

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { success: false, error: "A user with this email already exists" }
        }

        // 2. Hash the password
        // Use a salt round of 10 (standard balance of speed and security)
        const hashedPassword = await bcrypt.hash(password, 10)

        // 3. Create User in Database
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                rating: 1200, // Default chess rating
            }
        })

        // 4. Create JWT Token (Same logic as signin for auto-login after signup)
        const secret = new TextEncoder().encode(env.AUTH_SECRET)
        const token = await new SignJWT({
            userId: user.id,
            email: user.email
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)

        // 5. Set the Cookie
        const cookieStore = await cookies()
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 60 * 60 * 24,
            path: "/",
        })

        return { success: true, data: { token }, error: null }

    } catch (error) {
        console.error("Signup Error:", error)
        if (error instanceof Error)
            return { success: false, error: error.message }
        else
            return { success: false, error: "Failed to create account. Please try again." }
    }
}