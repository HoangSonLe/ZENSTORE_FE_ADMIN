"use client";
import dynamic from 'next/dynamic';
import { Inter } from "next/font/google";
import { useThemeStore } from "@/store";
import { cn } from "@/lib/utils";

// Dynamically import heavy components
const ThemeProvider = dynamic(() => import("next-themes").then(mod => mod.ThemeProvider), {
  ssr: false
});
const ReactToaster = dynamic(() => import("@/components/ui/toaster").then(mod => mod.Toaster), {
  ssr: false
});
const Toaster = dynamic(() => import("react-hot-toast").then(mod => mod.Toaster), {
  ssr: false
});
const SonnToaster = dynamic(() => import("@/components/ui/sonner").then(mod => mod.SonnToaster), {
  ssr: false
});

const inter = Inter({ subsets: ["latin"] });

const OptimizedProviders = ({ children }: { children: React.ReactNode }) => {
  const { theme, radius } = useThemeStore();

  return (
    <body
      className={cn("dash-tail-app", inter.className, "theme-" + theme)}
      style={{ "--radius": `${radius}rem` } as React.CSSProperties}
    >
      <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
        <div className={cn("h-full")}>
          {children}
          <ReactToaster />
        </div>
        <Toaster />
        <SonnToaster />
      </ThemeProvider>
    </body>
  );
};

export default OptimizedProviders;