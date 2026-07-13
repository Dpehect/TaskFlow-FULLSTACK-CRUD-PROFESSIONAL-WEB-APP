import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Auth is misconfigured. Check AUTH_SECRET, AUTH_GITHUB_ID, and AUTH_GITHUB_SECRET on the server.",
  AccessDenied: "Access denied. You may have cancelled GitHub authorization.",
  Verification: "The sign-in link is no longer valid.",
  OAuthSignin: "Could not start GitHub sign-in. Check Client ID / Secret.",
  OAuthCallback:
    "GitHub callback failed. Confirm the callback URL matches production exactly.",
  OAuthCreateAccount: "Could not create your account in the database.",
  EmailCreateAccount: "Could not create account.",
  Callback: "Authentication callback error. Check OAuth app settings.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method.",
  Default: "Sign-in failed. Please try again.",
};

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/dashboard";
  const errorKey = params.error;
  const errorMessage = errorKey
    ? AUTH_ERROR_MESSAGES[errorKey] ?? AUTH_ERROR_MESSAGES.Default
    : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            TF
          </div>
          <CardTitle className="text-2xl">Welcome to TaskFlow</CardTitle>
          <CardDescription>
            Sign in with GitHub to manage your projects and tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-left text-sm text-destructive"
            >
              <p className="font-medium">Sign-in error{errorKey ? ` (${errorKey})` : ""}</p>
              <p className="mt-1 text-destructive/90">{errorMessage}</p>
            </div>
          )}

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: callbackUrl });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <GitHubIcon className="size-4" />
              Continue with GitHub
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            After GitHub authorizes you, you will return to the dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
