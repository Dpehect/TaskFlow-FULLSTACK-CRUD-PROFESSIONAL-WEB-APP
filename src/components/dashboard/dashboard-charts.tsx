"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PriorityChartPoint, StatusChartPoint } from "@/types/dashboard";

type DashboardChartsProps = {
  statusChart: StatusChartPoint[];
  priorityChart: PriorityChartPoint[];
  filtered?: boolean;
};

const FALLBACK_STATUS = ["#64748b", "#f59e0b", "#10b981"];
const FALLBACK_PRIORITY = ["#94a3b8", "#6366f1", "#ef4444"];

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function DashboardCharts({
  statusChart,
  priorityChart,
  filtered = false,
}: DashboardChartsProps) {
  const statusTotal = statusChart.reduce((sum, item) => sum + item.count, 0);
  const priorityTotal = priorityChart.reduce((sum, item) => sum + item.count, 0);
  const scope = filtered ? "Filtered tasks" : "All tasks";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tasks by status</CardTitle>
          <CardDescription>
            Distribution across To Do, In Progress, and Done · {scope}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusTotal === 0 ? (
            <ChartEmpty label="No tasks to chart yet" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {statusChart.map((entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={FALLBACK_STATUS[index % FALLBACK_STATUS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} tasks`, "Count"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                {statusChart.map((entry, index) => (
                  <li key={entry.status} className="flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          FALLBACK_STATUS[index % FALLBACK_STATUS.length],
                      }}
                    />
                    {entry.label}
                    <span className="font-medium text-foreground">
                      {entry.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks by priority</CardTitle>
          <CardDescription>
            Low · Medium · High breakdown · {scope}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {priorityTotal === 0 ? (
            <ChartEmpty label="No tasks to chart yet" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityChart}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} tasks`, "Count"]}
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {priorityChart.map((entry, index) => (
                      <Cell
                        key={entry.priority}
                        fill={
                          FALLBACK_PRIORITY[index % FALLBACK_PRIORITY.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
