"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutLoader from "@/components/layout-loader";

const Page = () => {
    const router = useRouter();

    // Redirect to products page on client side
    useEffect(() => {
        router.push("/pages/products");
    }, [router]);

    // Show a loading indicator while redirecting
    return <LayoutLoader />;
};

export default Page;
