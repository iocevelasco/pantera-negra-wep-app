import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecentSales } from "@/components/recent-sales";
import { Overview } from "@/components/overview";
import { DashboardStatsCards } from "./dashboard-stats-cards";
import { DashboardAtRiskMembers } from "./dashboard-at-risk-members";
import { useTranslation } from "@/hooks/use-translation";

export function DashboardSummary() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <DashboardStatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("dashboard.attendance.title")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("dashboard.recentPayments.title")}</CardTitle>
            <CardDescription>
              {t("dashboard.recentPayments.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
