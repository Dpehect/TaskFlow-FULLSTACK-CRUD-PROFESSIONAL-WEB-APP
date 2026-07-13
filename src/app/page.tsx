import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  LayoutDashboard,
  Kanban,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5" />
          Portfolio-ready task management SaaS
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ship work faster with{" "}
          <span className="text-primary">TaskFlow</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Create projects, manage tasks on a drag-and-drop Kanban board, track
          productivity on a clean dashboard — no external AI keys required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            Get started with GitHub
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: LayoutDashboard,
            title: "Dashboard insights",
            body: "Charts and stats for completion rate, priorities, and productivity.",
          },
          {
            icon: Kanban,
            title: "Kanban board",
            body: "Drag and drop across To Do, In Progress, and Done with priorities.",
          },
          {
            icon: CheckCircle2,
            title: "Smart client tools",
            body: "Due labels, task breakdowns, and suggestions — all local logic.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-card p-5 text-left shadow-sm"
          >
            <feature.icon className="mb-3 size-5 text-primary" />
            <h2 className="font-semibold">{feature.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
