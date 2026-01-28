'use client'
import { getAuthenticatedUser, User } from "@/app/actions/auth"
import { useEffect, useState } from "react"

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function getUser() {
            try {
                const response = await getAuthenticatedUser()
                console.log(response)
                if (isMounted) {
                    if (!response.success) throw new Error(response.error)

                    setUser(response.data);
                }
            } catch (err) {
                if (isMounted) {
                    if (err instanceof Error) setError(err);
                    else setError(new Error("Internal server error"));
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        getUser();

        return () => { isMounted = false };

    }, [])

    return { user, loading, error }
}