import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  ClipboardList,
  BookOpen,
  Plus,
  ArrowRight,
  HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import { getDashboardStats } from "@/lib/firestore";
import { formatDate, getDaysSince } from "@/lib/utils";
import { formatStorageSize, STORAGE_LIMIT_BYTES } from "@/lib/storage";
import type { Timestamp } from "firebase/firestore";

export default function DashboardPage() {
  const { user, doctor } = useAuth();
  const { cases, loading } = useCases();
  const [stats, setStats] = useState({
    activeCases: 0,
    totalCases: 0,
    todayEntries: 0,
    caseStudies: 0,
  });

  useEffect(() => {
    if (!user) return;
    getDashboardStats(user.uid).then(setStats);
  }, [user, cases]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const recentCases = cases.slice(0, 5);

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        );
      case "discharged":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Discharged
          </Badge>
        );
      case "follow-up":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Follow-up
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {greeting()}, Dr. {doctor?.displayName?.split(" ")[0] ?? ""}
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-1">
            Here's what's happening with your cases today.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0">
          <Link to="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Active Cases
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Total Cases
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Today's Entries
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayEntries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Case Studies
            </CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.caseStudies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Storage
            </CardTitle>
            <HardDrive className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatStorageSize(doctor?.storageUsedBytes ?? 0)}
            </div>
            <div className="mt-1 w-full h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (doctor?.storageUsedBytes ?? 0) >= STORAGE_LIMIT_BYTES
                    ? "bg-red-500"
                    : "bg-teal-500"
                }`}
                style={{
                  width: `${Math.min(((doctor?.storageUsedBytes ?? 0) / STORAGE_LIMIT_BYTES) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Cases</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/cases">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-[hsl(var(--muted))] animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : recentCases.length === 0 ? (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <ClipboardList className="mx-auto h-12 w-12 mb-3 opacity-30" />
              <p>No cases yet. Create your first case to get started.</p>
              <Button asChild className="mt-4">
                <Link to="/cases/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Case
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCases.map((c) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {statusBadge(c.status)}
                      <span className="font-medium text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                        {c.caseNumber}
                      </span>
                      <span className="font-semibold text-sm sm:text-base truncate">
                        {c.patient.name}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {c.admission.initialDiagnosis} •{" "}
                      {c.admission.date
                        ? `Admitted ${formatDate((c.admission.date as Timestamp).toDate())}`
                        : ""}{" "}
                      {c.status === "active" && c.admission.date
                        ? `• Day ${getDaysSince((c.admission.date as Timestamp).toDate()) + 1}`
                        : ""}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
