import { NextResponse } from "next/server";

export function middleware(request: any) {
    const pathname = request.nextUrl.pathname;
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/products", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip all internal paths (_next, assets, api)
        //"/((?!api|assets|.*\\..*|_next).*)",
        "/((?!api|assets|docs|.*\\..*|_next).*)",
        // Optional: only run on root (/) URL
    ],
};
