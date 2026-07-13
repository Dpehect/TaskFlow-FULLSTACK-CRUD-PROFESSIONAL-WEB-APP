"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type {
  DashboardProjectSummary,
  TaskFiltersState,
} from "@/types/dashboard";
import { countActiveFilters, DEFAULT_FILTERS } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

type TaskFiltersProps = {
  filters: TaskFiltersState;
  onChange: (next: TaskFiltersState) => void;
  projects: DashboardProjectSummary[];
  resultCount: number;
  totalCount: number;
};

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function TaskFilters({
  filters,
  onChange,
  projects,
  resultCount,
  totalCount,
}: TaskFiltersProps) {
  const active = countActiveFilters(filters);

  const patch = (partial: Partial<TaskFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const clear = () => onChange({ ...DEFAULT_FILTERS });

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Search & filters</h2>
          <p className="text-xs text-muted-foreground">
            Showing {resultCount} of {totalCount} tasks
            {active > 0 ? ` · ${active} filter${active > 1 ? "s" : ""} active` : ""}
          </p>
        </div>
        {active > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            <X className="size-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(e) => patch({ query: e.target.value })}
          placeholder="Search by title or description…"
          className="pl-9"
          aria-label="Search tasks"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-project" className="text-xs">
            Project
          </Label>
          <select
            id="filter-project"
            className={selectClass}
            value={filters.projectId}
            onChange={(e) =>
              patch({ projectId: e.target.value as TaskFiltersState["projectId"] })
            }
          >
            <option value="ALL">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-status" className="text-xs">
            Status
          </Label>
          <select
            id="filter-status"
            className={selectClass}
            value={filters.status}
            onChange={(e) =>
              patch({ status: e.target.value as TaskFiltersState["status"] })
            }
          >
            <option value="ALL">All statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-priority" className="text-xs">
            Priority
          </Label>
          <select
            id="filter-priority"
            className={selectClass}
            value={filters.priority}
            onChange={(e) =>
              patch({ priority: e.target.value as TaskFiltersState["priority"] })
            }
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-due" className="text-xs">
            Due date
          </Label>
          <select
            id="filter-due"
            className={selectClass}
            value={filters.due}
            onChange={(e) =>
              patch({ due: e.target.value as TaskFiltersState["due"] })
            }
          >
            <option value="ALL">All due dates</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DUE_SOON">Due soon (≤ 3 days)</option>
            <option value="ON_TRACK">On track</option>
            <option value="NO_DATE">No due date</option>
          </select>
        </div>
      </div>

      {active > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.query.trim() && (
            <FilterChip
              label={`Search: “${filters.query.trim()}”`}
              onRemove={() => patch({ query: "" })}
            />
          )}
          {filters.projectId !== "ALL" && (
            <FilterChip
              label={`Project: ${
                projects.find((p) => p.id === filters.projectId)?.name ?? "…"
              }`}
              onRemove={() => patch({ projectId: "ALL" })}
            />
          )}
          {filters.status !== "ALL" && (
            <FilterChip
              label={`Status: ${filters.status.replace("_", " ")}`}
              onRemove={() => patch({ status: "ALL" })}
            />
          )}
          {filters.priority !== "ALL" && (
            <FilterChip
              label={`Priority: ${filters.priority}`}
              onRemove={() => patch({ priority: "ALL" })}
            />
          )}
          {filters.due !== "ALL" && (
            <FilterChip
              label={`Due: ${filters.due.replace("_", " ")}`}
              onRemove={() => patch({ due: "ALL" })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 font-normal">
      <span className="max-w-[14rem] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-full hover:bg-foreground/10"
        )}
        aria-label={`Remove filter ${label}`}
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
