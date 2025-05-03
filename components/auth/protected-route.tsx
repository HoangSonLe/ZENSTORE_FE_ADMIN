"use client";

import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, authEnabled } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If authentication is enabled, not loading, and not authenticated, redirect to login
        if (authEnabled && !loading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, loading, router, authEnabled]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If authentication is disabled or user is authenticated, render children
    return !authEnabled || isAuthenticated ? <>{children}</> : null;
}
