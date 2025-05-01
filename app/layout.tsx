import { siteConfig } from "@/config/site";
import DirectionProvider from "@/provider/direction.provider";
import Providers from "@/provider/providers";
import TanstackProvider from "@/provider/providers.client";
import { AuthProvider } from "@/context/auth-context";
import "flatpickr/dist/themes/light.css";
import { Inter } from "next/font/google";
import "simplebar-react/dist/simplebar.min.css";
import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import "./styles/z-index-fixes.css";
import "./styles/ckeditor-fixes.css";
import Script from "next/script";
import dynamic from "next/dynamic";

// Import the chunk error handler with no SSR
const ChunkErrorHandler = dynamic(() => import("@/components/chunk-error-handler"), {
    ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
};

export default function RootLayout({
    children,
    params: { lang },
}: {
    children: React.ReactNode;
    params: { lang: string };
}) {
    return (
        <html lang={lang} className={inter.className}>
            <head>
                {/* Load runtime config first, then path config */}
                <Script src="/runtime-config.js" strategy="beforeInteractive" />
                <Script src="/path-config.js" strategy="beforeInteractive" />
            </head>
            <AuthProvider>
                <TanstackProvider>
                    <Providers>
                        <DirectionProvider lang={lang}>
                            <ChunkErrorHandler />
                            {children}
                        </DirectionProvider>
                    </Providers>
                </TanstackProvider>
            </AuthProvider>
        </html>
    );
}
