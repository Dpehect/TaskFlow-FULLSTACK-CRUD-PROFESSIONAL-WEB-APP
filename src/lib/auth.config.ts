import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Edge-compatible Auth config (used by middleware).
 * No Prisma / Node-only APIs here.
 *
 * Env (Auth.js v5 auto-reads AUTH_*):
 * - AUTH_SECRET
 * - AUTH_URL (or AUTH_TRUST_HOST=true on Vercel)
 * - AUTH_GITHUB_ID / AUTH_GITHUB_SECRET
 */
export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
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

      if (isDashboard) {
        return isLoggedIn;
      }

      return true;
    },
  },
  // Required on Vercel so host is trusted without manual AUTH_URL mismatch
  trustHost: true,
} satisfies NextAuthConfig;
