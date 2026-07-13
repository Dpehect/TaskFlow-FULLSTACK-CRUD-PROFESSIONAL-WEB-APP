import { auth } from "@/lib/auth";

/** Require a signed-in user id (server-only helpers). */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
