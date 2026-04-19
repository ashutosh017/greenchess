'use server'

import { JWTPayload, jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcrypt'
import { cookies } from "next/headers"
import { env } from "@/lib/env"
import { ApiResponse } from "@/lib/api-response"
import prisma from '@/lib/prisma'
import { cache } from 'react'
import { z } from 'zod'

const signinSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
    country: z.string().optional(),
})

export interface User {
    id: string,
    username: string,
    email: string,
    avatarUrl: string | null
}

export async function logout() {
    (await cookies()).delete("auth_token")
}

export const getAuthenticatedUser =
    cache(
        async (): Promise<ApiResponse<User>> => {
            const token = await getToken();
            if (!token.data) return { success: false, data: null, error: token.error || "JWT not found" }
            try {
                const verify = await verifyToken(token.data)
                if (!verify.data) throw new Error("Invalid token")
                const user = await prisma.user.findFirst({
                    where: {
                        id: verify.data.userId
                    }
                })
                if (!user) throw new Error("User not found")
                return {
                    success: true, data: {
                        id: user.id,
                        username: user.username || "",
                        email: user.email,
                        avatarUrl: user.image
                    },
                    error: null,
                }
            } catch (error) {
                if (error instanceof Error) {
                    return {
                        success: false,
                        data: null,
                        error: error.message,
                    }
                }
                else {
                    return {
                        success: false,
                        data: null,
                        error: "Internal server error"
                    }
                }
            }

        })
export async function getToken(): Promise<ApiResponse<string>> {
    const cookieStore = await cookies()
    const tokenKeyPair = cookieStore.get('auth_token')
    if (!tokenKeyPair) return { success: false, data: null, error: "No token found" }
    const token = tokenKeyPair.value
    return {
        success: true,
        data: token,
        error: null
    }
}
interface TokenPayload extends JWTPayload {
    userId: string,
    email: string
}
export async function verifyToken(token: string): Promise<ApiResponse<TokenPayload>> {
    try {
        const secret = new TextEncoder().encode(env.AUTH_SECRET)
        const verified = await jwtVerify(token, secret)
        return {
            success: true,
            data: verified.payload as TokenPayload,
            error: null
        }
    } catch (error) {
        return {
            success: false,
            data: null,
            error: "Invalid or expired token"
        }
    }
}

export async function signin(prevState: any, formData: FormData): Promise<ApiResponse<{ token: string }>> {

    const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    try {

        const validatedFields = signinSchema.safeParse(rawData)
        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors
            return { success: false, data: null, error: errors.email?.[0] || errors.password?.[0] || "Validation failed", fields: rawData }
        }

        const { email, password } = validatedFields.data

        // 1. Find user

        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user)
            console.log("user does not exist")
        if (!user || !user.password) {
            console.log("password does not exist")
            return { success: false, data: null, error: "Invalid email or password", fields: rawData }
        }

        // 2. Verify Password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            console.log("password didnt match")
            return { success: false, data: null, error: "Invalid email or password", fields: rawData }
        }

        // 3. Create JWT Token using 'jose'
        const secret = new TextEncoder().encode(env.AUTH_SECRET)
        const token = await new SignJWT({
            userId: user.id,
            email: user.email
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(new Date())
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

        return { success: true, data: { token }, error: null }
    } catch (error) {
        console.error("Signin Error:", error)
        return { success: false, data: null, error: "Something went wrong. Please try again.", fields: rawData }
    }
}


export async function signup(prevState: any, formData: FormData): Promise<ApiResponse<{ token: string }>> {
    const rawData = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        name: formData.get("name") as string | undefined,
        country: formData.get("country") as string | undefined,
    }

    try {

        const validatedFields = signupSchema.safeParse(rawData)
        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors
            return { 
                success: false, 
                data: null, 
                error: errors.username?.[0] || errors.email?.[0] || errors.password?.[0] || "Validation failed", 
                fields: {
                    username: rawData.username,
                    email: rawData.email,
                    password: rawData.password,
                }
            }
        }

        const { username, email, password, name, country = "Unknown" } = validatedFields.data

        // 1. Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{
                    email
                }, {
                    username
                }]
            }
        })

        if (existingUser) {
            return { success: false, data: null, error: "A user with this email already exists", fields: { username, email, password } }
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
        const fields = {
            username: rawData.username,
            email: rawData.email,
            password: rawData.password,
        }
        if (error instanceof Error)
            return { success: false, data: null, error: error.message, fields }
        else
            return { success: false, data: null, error: "Failed to create account. Please try again.", fields }
    }
}

