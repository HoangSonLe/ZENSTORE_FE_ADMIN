"use client";
import { Inter } from "next/font/google";
import { useThemeStore } from "@/store";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { Toaster as ReactToaster } from "@/components/ui/toaster";
import { Toaster } from "react-hot-toast";
import { SonnToaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initViewportHeight } from "@/utils/viewport-height";

const inter = Inter({ subsets: ["latin"] });
const Providers = ({ children }: { children: React.ReactNode }) => {
    const { theme, radius } = useThemeStore();
    const location = usePathname();

    // Initialize viewport height calculation
    useEffect(() => {
        const cleanup = initViewportHeight();
        return cleanup;
    }, []);

    if (location === "/") {
        return (
            <body className={cn("dash-tail-app ", inter.className)}>
                <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
                    <div className={cn("h-full  ")}>
                        {children}
                        <ReactToaster />
                    </div>
                    <Toaster />
                    <SonnToaster position="top-right" />
                </ThemeProvider>
            </body>
        );
    }
    return (
        <body
            className={cn("dash-tail-app ", inter.className, "theme-" + theme)}
            style={
                {
                    "--radius": `${radius}rem`,
                } as React.CSSProperties
            }
        >
            <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
                <div className={cn("h-full  ")}>
                    {children}
                    <ReactToaster />
                </div>
                <Toaster />
                <SonnToaster position="top-right" />
            </ThemeProvider>
        </body>
    );
};

export default Providers;
