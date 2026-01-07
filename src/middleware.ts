import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const { pathname } = request.nextUrl;

    // Halaman publik
    if (pathname === "/login") {
        if (token) {
            // Sudah login, redirect ke dashboard sesuai role
            const redirectUrl =
                token.role === "ADMIN" ? "/admin" : "/unit-kerja";
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
    }

    // Halaman yang butuh auth
    if (pathname.startsWith("/admin") || pathname.startsWith("/unit-kerja")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Cek akses berdasarkan role
        if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/unit-kerja", request.url));
        }

        if (pathname.startsWith("/unit-kerja") && token.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    // Redirect root ke login atau dashboard
    if (pathname === "/") {
        if (token) {
            const redirectUrl =
                token.role === "ADMIN" ? "/admin" : "/unit-kerja";
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect /dashboard ke role-specific dashboard
    if (pathname === "/dashboard") {
        if (token) {
            const redirectUrl =
                token.role === "ADMIN" ? "/admin" : "/unit-kerja";
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login", "/dashboard", "/admin/:path*", "/unit-kerja/:path*"],
};
