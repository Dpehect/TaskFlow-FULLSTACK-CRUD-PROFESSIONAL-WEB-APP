import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already signed in → leave login page
  if (isLogin && isLoggedIn) {
    const callback = req.nextUrl.searchParams.get("callbackUrl");
    const target =
      callback && callback.startsWith("/") && !callback.startsWith("//")
        ? callback
        : "/dashboard";
    return NextResponse.redirect(new URL(target, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Do not run on static assets / api (Auth.js needs /api/auth/* without this wrapper redirect logic)
  matcher: ["/dashboard/:path*", "/dashboard", "/login"],
};
