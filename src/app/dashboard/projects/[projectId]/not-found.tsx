import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Project not found</h1>
      <p className="text-sm text-muted-foreground">
        This project does not exist or you do not have access to it.
      </p>
      <Link href="/dashboard" className={cn(buttonVariants())}>
        Back to dashboard
      </Link>
    </div>
  );
}
