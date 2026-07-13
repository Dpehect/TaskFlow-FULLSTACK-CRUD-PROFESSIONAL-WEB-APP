"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateProductivityScore } from "@/lib/smart";
import type { DashboardStats } from "@/types/dashboard";
import { cn } from "@/lib/utils";

type ProductivityScoreProps = {
  stats: DashboardStats;
};

export function ProductivityScore({ stats }: ProductivityScoreProps) {
  const { score, label, tone } = calculateProductivityScore({
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks,
    overdueOpenTasks: stats.overdueTasks,
  });

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const ringClass =
    tone === "high"
      ? "stroke-emerald-500"
      : tone === "medium"
        ? "stroke-indigo-500"
        : tone === "empty"
          ? "stroke-muted-foreground/30"
          : "stroke-amber-500";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Productivity Score</CardTitle>
        <CardDescription>
          Client-side score from completion rate
          {stats.overdueTasks > 0
            ? ", with a light penalty for overdue open tasks"
            : ""}
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative size-36 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              className="stroke-muted"
              strokeWidth="10"
            />
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={cn(ringClass)}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums tracking-tight">
              {score}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
          <p className="text-base font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">
            {stats.completedTasks} of {stats.totalTasks} tasks completed
            {stats.overdueTasks > 0
              ? ` · ${stats.overdueTasks} overdue`
              : ""}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn(
                "h-full rounded-full",
                tone === "high" && "bg-emerald-500",
                tone === "medium" && "bg-indigo-500",
                tone === "low" && "bg-amber-500",
                tone === "empty" && "bg-muted-foreground/30"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Formula: (Completed ÷ Total) × 100
            {stats.overdueTasks > 0 ? " − overdue penalty" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
