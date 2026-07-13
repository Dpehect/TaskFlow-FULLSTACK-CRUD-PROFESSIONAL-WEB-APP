"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { DashboardPayload, TaskFiltersState } from "@/types/dashboard";
import {
  DEFAULT_FILTERS,
  buildPriorityChart,
  buildStatusChart,
  countActiveFilters,
  filterTasks,
} from "@/lib/dashboard";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProductivityScore } from "@/components/dashboard/productivity-score";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { TaskFilters } from "@/components/dashboard/task-filters";
import { TaskList } from "@/components/dashboard/task-list";
import { ProjectsSection } from "@/components/dashboard/projects-section";

type DashboardViewProps = {
  data: DashboardPayload;
};

export function DashboardView({ data }: DashboardViewProps) {
  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS);

  const filteredTasks = useMemo(
    () => filterTasks(data.tasks, filters),
    [data.tasks, filters]
  );

  const activeFilterCount = countActiveFilters(filters);
  const chartsReflectFilters = activeFilterCount > 0;

  // Stats cards stay global; charts & list follow filters for a cohesive UX
  const chartSource = chartsReflectFilters ? filteredTasks : data.tasks;
  const statusChart = useMemo(
    () => buildStatusChart(chartSource),
    [chartSource]
  );
  const priorityChart = useMemo(
    () => buildPriorityChart(chartSource),
    [chartSource]
  );

  const firstName = data.userName?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {firstName}. Track progress, filter work, and jump
            into any project board.
          </p>
        </div>
      </motion.div>

      <StatsCards stats={data.stats} />

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ProductivityScore stats={data.stats} />
        </div>
        <div className="xl:col-span-3">
          <DashboardCharts
            statusChart={statusChart}
            priorityChart={priorityChart}
            filtered={chartsReflectFilters}
          />
        </div>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        projects={data.projects}
        resultCount={filteredTasks.length}
        totalCount={data.tasks.length}
      />

      <TaskList
        tasks={filteredTasks}
        hasFilters={activeFilterCount > 0}
      />

      <ProjectsSection projects={data.projects} />
    </div>
  );
}
