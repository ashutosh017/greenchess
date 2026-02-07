'use server'

import { ApiResponse } from "@/lib/api-response"
import prisma from "@/lib/prisma"

interface User {
    id: string,
    name: string | null,
    username: string | null,
    email: string,
    avatarUrl: string | null,
}

export async function findUserByEmail(email: string): Promise<ApiResponse<User>> {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            throw new Error("User Not Found")
        }
        return {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                username: user.username,
                avatarUrl: user.image,
                email: user.email
            },
            error: null

        }
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
                data: null
            }
        }
        return {
            success: false,
            error: "Internal server error",
            data: null
        }
    }
}