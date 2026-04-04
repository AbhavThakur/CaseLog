import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Activity,
  Calendar,
  Building2,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getAnalyticsData, type AnalyticsData } from "@/lib/firestore";

const OUTCOME_COLORS: Record<string, string> = {
  recovered: "bg-emerald-500",
  improved: "bg-blue-500",
  LAMA: "bg-amber-500",
  referred: "bg-purple-500",
  expired: "bg-red-500",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  "follow-up": "bg-amber-500",
  discharged: "bg-purple-500",
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getAnalyticsData(user.uid)
      .then(setData)
      .catch((err) => console.error("Analytics fetch failed:", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-[hsl(var(--muted))] animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxMonthly = Math.max(...data.casesByMonth.map((m) => m.count), 1);
  const maxTag = Math.max(...data.casesByTag.map((t) => t.count), 1);
  const totalOutcomes = data.casesByOutcome.reduce(
    (sum, o) => sum + o.count,
    0,
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[hsl(var(--primary))]" />
            Analytics
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Overview of your case data and trends
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Total Patients
                </p>
                <span className="text-2xl font-bold">{data.totalPatients}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Case Studies
                </p>
                <span className="text-2xl font-bold">
                  {data.caseStudyCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Avg Stay
                </p>
                <span className="text-2xl font-bold">
                  {data.avgStayDays}
                  <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
                    {" "}
                    days
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  IPD / OPD
                </p>
                <span className="text-lg font-bold">
                  {data.visitTypeSplit.ipd}{" "}
                  <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
                    /
                  </span>{" "}
                  {data.visitTypeSplit.opd}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
              Cases by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-40">
              {data.casesByMonth.map((m) => {
                const height =
                  m.count > 0 ? Math.max((m.count / maxMonthly) * 100, 8) : 4;
                const label = m.month.split("-")[1];
                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                      {m.count > 0 ? m.count : ""}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-[hsl(var(--primary))]/80 hover:bg-[hsl(var(--primary))] transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Case Status Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-rose-500" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.casesByStatus.map((s) => (
                <div key={s.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{s.status}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {s.count}
                    </span>
                  </div>
                  <div className="h-2.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${STATUS_COLORS[s.status] ?? "bg-gray-500"}`}
                      style={{
                        width: `${data.totalPatients > 0 ? (s.count / data.totalPatients) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Visit type split */}
            <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                Visit Type
              </p>
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-center">
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {data.visitTypeSplit.ipd}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    IPD (In-Patient)
                  </p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {data.visitTypeSplit.opd}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    OPD (Out-Patient)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outcomes */}
        {data.casesByOutcome.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-500" />
                Discharge Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.casesByOutcome.map((o) => (
                  <div key={o.outcome} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">
                        {o.outcome}
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {o.count}{" "}
                        <span className="text-xs">
                          (
                          {totalOutcomes > 0
                            ? Math.round((o.count / totalOutcomes) * 100)
                            : 0}
                          %)
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${OUTCOME_COLORS[o.outcome] ?? "bg-gray-500"}`}
                        style={{
                          width: `${totalOutcomes > 0 ? (o.count / totalOutcomes) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Tags */}
        {data.casesByTag.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Conditions / Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {data.casesByTag.map((t, i) => (
                  <div key={t.tag} className="flex items-center gap-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))] w-5 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{t.tag}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {t.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]/70"
                          style={{
                            width: `${(t.count / maxTag) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
