import { getDashboardData } from "@/lib/actions/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardView data={data} />;
}
