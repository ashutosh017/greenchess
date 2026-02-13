import { getAuthenticatedUser } from "@/app/actions/auth";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const socket_id = formData.get("socket_id") as string;
    const channel_name = formData.get("channel_name") as string;

    const customUser = await getAuthenticatedUser();
    const session = await auth();

    let userId: string | null = null;
    let username: string | null = null;

    // Custom auth
    if (customUser?.data) {
        userId = customUser.data.id;
        username = customUser.data.username;
    }

    // NextAuth fallback
    if (!userId && session?.user) {
        userId = session.user.id ?? null;
        username = session.user.name ?? "User";
    }

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const authResponse = pusherServer.authorizeChannel(
            socket_id,
            channel_name,
            {
                user_id: userId,
                user_info: {
                    name: username,
                },
            }
        );

        return NextResponse.json(authResponse);
    } catch (error) {
        return NextResponse.json({
            error
        }, { status: 500 })
    }
}
