"use client";

import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import ProtectedRoute from "@/components/auth/protected-route";
import { getTranslations } from "@/utils/translations";

const Layout = ({
    children,
    params: { lang },
}: {
    children: React.ReactNode;
    params: { lang: any };
}) => {
    // Get translations from our simplified utility
    const trans = getTranslations();

    return (
        <ProtectedRoute>
            <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
        </ProtectedRoute>
    );
};

export default Layout;
