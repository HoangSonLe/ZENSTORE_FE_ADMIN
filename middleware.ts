import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Redirect root to products
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/products", request.url));
    }

    // Check for protected routes
    if (pathname.startsWith("/(dashboard)") || pathname.startsWith("/dashboard")) {
        // Temporarily skip token validation
        // In a real application, you would check for a valid token here
        // Uncomment the following code when you want to enable authentication again
        /*
        const token = request.cookies.get("authToken")?.value;
        if (!token) {
            // Redirect to login if not authenticated
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        */
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip all internal paths (_next, assets, api)
        "/((?!api|assets|docs|.*\\..*|_next).*)",
        // Optional: only run on root (/) URL
    ],
};
