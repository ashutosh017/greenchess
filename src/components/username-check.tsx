"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export function UsernameCheck() {
  const auth = useAuth();
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Prevent redirect loop and allow access to auth / public endpoints
    if (
      pathname === "/setup-username" ||
      pathname === "/signin" ||
      pathname === "/signup" ||
      pathname.startsWith("/api")
    ) {
      return;
    }

    const checkUsername = () => {
      const user = auth.user;
      if (user && !user.username) {
        router.replace("/setup-username");
      }
    };

    if (!auth.loading) {
      checkUsername();
    }
  }, [auth.user, auth.loading, session.status, pathname, router]);

  return null;
}
