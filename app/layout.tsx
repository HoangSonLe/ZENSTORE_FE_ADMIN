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
