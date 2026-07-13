import { handlers } from "@/lib/auth";
import { NextResponse } from "next/server";

function missingAuthEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.AUTH_SECRET?.trim()) missing.push("AUTH_SECRET");
  if (!process.env.AUTH_GITHUB_ID?.trim()) missing.push("AUTH_GITHUB_ID");
  if (!process.env.AUTH_GITHUB_SECRET?.trim()) missing.push("AUTH_GITHUB_SECRET");
  return missing;
}

async function withConfigGuard(
  req: Request,
  handler: (req: Request) => Promise<Response>
) {
  const missing = missingAuthEnv();
  if (missing.length > 0) {
    console.error(
      "[auth] Missing environment variables:",
      missing.join(", ")
    );
    return NextResponse.json(
      {
        error: "Configuration",
        message: `Missing environment variables: ${missing.join(", ")}. Set them in Vercel → Settings → Environment Variables, then Redeploy.`,
        missing,
      },
      { status: 500 }
    );
  }

  try {
    return await handler(req);
  } catch (error) {
    console.error("[auth] handler error:", error);
    return NextResponse.json(
      {
        error: "Configuration",
        message:
          error instanceof Error
            ? error.message
            : "Auth handler failed. Check Vercel function logs.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return withConfigGuard(req, (r) => handlers.GET(r));
}

export async function POST(req: Request) {
  return withConfigGuard(req, (r) => handlers.POST(r));
}
