"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { suggestSubTasks } from "@/lib/smart";
import { createTasks } from "@/lib/actions/tasks";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SmartBreakDownProps = {
  projectId: string;
  parentTitle: string;
  /** Compact trigger for kanban cards */
  compact?: boolean;
  className?: string;
  /** Prevent dnd-kit from capturing the click */
  onPointerDown?: (e: React.PointerEvent) => void;
};

export function SmartBreakDown({
  projectId,
  parentTitle,
  compact = false,
  className,
  onPointerDown,
}: SmartBreakDownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const suggestions = useMemo(
    () => suggestSubTasks(parentTitle, 4),
    [parentTitle]
  );

  const [selected, setSelected] = useState<string[]>([]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setSelected(suggestions);
    }
  };

  const toggle = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const addSelected = () => {
    if (selected.length === 0) {
      toast.error("Select at least one sub-task");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createTasks({
          projectId,
          titles: selected,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(
          `Added ${result.count} sub-task${result.count === 1 ? "" : "s"}`
        );
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add sub-tasks"
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        onPointerDown={onPointerDown}
        className={cn(
          compact
            ? buttonVariants({ variant: "ghost", size: "xs" })
            : buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1",
          className
        )}
      >
        <Sparkles className="size-3.5" />
        {compact ? "Break down" : "Smart Break Down"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-500" />
            Smart Break Down
          </DialogTitle>
          <DialogDescription>
            Client-side suggestions for{" "}
            <span className="font-medium text-foreground">“{parentTitle}”</span>
            . No external AI — pure keyword rules.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-2">
          {suggestions.map((title) => {
            const checked = selected.includes(title);
            return (
              <li key={title}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition",
                    checked
                      ? "border-primary/40 bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                    checked={checked}
                    onChange={() => toggle(title)}
                    disabled={isPending}
                  />
                  <span className="leading-snug">{title}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="mt-4 gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => setSelected(suggestions)}
          >
            Select all
          </Button>
          <Button
            type="button"
            disabled={isPending || selected.length === 0}
            onClick={addSelected}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding…
              </>
            ) : (
              `Add ${selected.length} task${selected.length === 1 ? "" : "s"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
