import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";
import Script from "next/script";
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
        <html lang={lang}>
            <head>
                <Script
                    src="https://cdn.tiny.cloud/1/qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc/tinymce/6/tinymce.min.js"
                    strategy="beforeInteractive"
                    referrerPolicy="origin"
                />
            </head>
            <AuthProvider>
                <TanstackProvider>
                    <Providers>
                        <DirectionProvider lang={lang}>{children}</DirectionProvider>
                    </Providers>
                </TanstackProvider>
            </AuthProvider>
        </html>
    );
}
