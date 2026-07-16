'use server'

import { ApiResponse } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { getAuthenticatedUser } from "./auth"

interface User {
    id: string,
    name: string | null,
    username: string | null,
    email: string,
    avatarUrl: string | null,
    rating?: number,
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
                email: user.email,
                rating: user.rating
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

export async function saveUsername(username: string): Promise<ApiResponse<void>> {
    try {
        const authRes = await getAuthenticatedUser();
        if (!authRes.success || !authRes.data) {
            return { success: false, error: "Not authenticated", data: null };
        }

        const trimmed = username.trim();
        if (trimmed.length < 3) {
            return { success: false, error: "Username must be at least 3 characters", data: null };
        }

        // Check if username already exists
        const existing = await prisma.user.findFirst({
            where: { username: trimmed }
        });
        if (existing) {
            return { success: false, error: "Username is already taken", data: null };
        }

        // Update the user
        await prisma.user.update({
            where: { id: authRes.data.id },
            data: { username: trimmed }
        });

        return { success: true, error: null, data: null };
    } catch (error) {
        console.error("saveUsername error:", error);
        return { success: false, error: "Failed to save username", data: null };
    }
}