import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

const githubId = process.env.AUTH_GITHUB_ID?.trim();
const githubSecret = process.env.AUTH_GITHUB_SECRET?.trim();

/**
 * Edge-compatible Auth config (middleware + shared options).
 *
 * Required env on Vercel:
 * AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
 * AUTH_URL (production URL), AUTH_TRUST_HOST=true, DATABASE_URL
 */
export const authConfig = {
  providers: [
    GitHub({
      clientId: githubId ?? "",
      clientSecret: githubSecret ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) return isLoggedIn;
      return true;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
