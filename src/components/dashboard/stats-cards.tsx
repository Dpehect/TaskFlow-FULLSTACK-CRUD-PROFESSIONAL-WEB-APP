"use client";

import { motion } from "framer-motion";
import {
  FolderKanban,
  ListTodo,
  CircleCheckBig,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/types/dashboard";

type StatsCardsProps = {
  stats: DashboardStats;
};

const items = [
  {
    key: "totalProjects" as const,
    title: "Total Projects",
    icon: FolderKanban,
    format: (s: DashboardStats) => String(s.totalProjects),
    hint: "Active workspaces",
  },
  {
    key: "totalTasks" as const,
    title: "Total Tasks",
    icon: ListTodo,
    format: (s: DashboardStats) => String(s.totalTasks),
    hint: "Across all projects",
  },
  {
    key: "completedTasks" as const,
    title: "Completed",
    icon: CircleCheckBig,
    format: (s: DashboardStats) => String(s.completedTasks),
    hint: "Marked as Done",
  },
  {
    key: "completionRate" as const,
    title: "Completion Rate",
    icon: Percent,
    format: (s: DashboardStats) => `${s.completionRate}%`,
    hint: "Done ÷ total tasks",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <item.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {item.format(stats)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
