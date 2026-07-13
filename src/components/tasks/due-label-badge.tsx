"use client";

import { AlertTriangle, Clock3, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDueLabel } from "@/lib/kanban";
import type { DueLabel } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const META: Record<
  Exclude<DueLabel, "NO_DATE">,
  {
    label: string;
    icon: typeof Clock3;
    className: string;
  }
> = {
  OVERDUE: {
    label: "Overdue",
    icon: AlertTriangle,
    className:
      "border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  },
  DUE_SOON: {
    label: "Due Soon",
    icon: Clock3,
    className:
      "border-transparent bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  ON_TRACK: {
    label: "On Track",
    icon: CheckCircle2,
    className:
      "border-transparent bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
};

type DueLabelBadgeProps = {
  dueDate: Date | string | null | undefined;
  showDate?: boolean;
  className?: string;
  /** Hide label for completed work if desired */
  hideWhenDone?: boolean;
  isDone?: boolean;
};

export function DueLabelBadge({
  dueDate,
  showDate = true,
  className,
  hideWhenDone = false,
  isDone = false,
}: DueLabelBadgeProps) {
  if (!dueDate) return null;
  if (hideWhenDone && isDone) {
    return showDate ? (
      <Badge variant="secondary" className={cn("gap-1 font-normal", className)}>
        {format(new Date(dueDate), "MMM d")}
      </Badge>
    ) : null;
  }

  const dueLabel = getDueLabel(dueDate);
  if (dueLabel === "NO_DATE") return null;

  const meta = META[dueLabel];
  const Icon = meta.icon;

  return (
    <Badge className={cn("gap-1 font-normal", meta.className, className)}>
      <Icon className="size-3" />
      {showDate && (
        <span className="tabular-nums">{format(new Date(dueDate), "MMM d")}</span>
      )}
      <span>
        {showDate ? "· " : ""}
        {meta.label}
      </span>
    </Badge>
  );
}
