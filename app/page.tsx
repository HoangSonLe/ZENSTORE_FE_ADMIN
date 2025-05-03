"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutLoader from "@/components/layout-loader";
import { useAuth } from "@/context/auth-context";

const Page = () => {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    // Redirect based on authentication status
    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                router.push("/pages/products");
            } else {
                router.push("/auth/login");
            }
        }
    }, [router, isAuthenticated, loading]);

    // Show a loading indicator while redirecting
    return <LayoutLoader />;
};

export default Page;
