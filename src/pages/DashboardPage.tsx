import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  ClipboardList,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  Bell,
  Stethoscope,
  Users,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import {
  getDashboardStats,
  subscribeToReminders,
  dismissReminder,
  type DashboardStats,
} from "@/lib/firestore";
import { formatDate, formatTime } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";
import type { Reminder } from "@/lib/types";

export default function DashboardPage() {
  const { user, doctor } = useAuth();
  const { cases, loading } = useCases();
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    totalCases: 0,
    todayEntries: 0,
    caseStudies: 0,
    followUpCases: 0,
    dischargedCases: 0,
    criticalEntriesToday: 0,
    thisWeekNewCases: 0,
    thisMonthNewCases: 0,
    lastEntryTime: null,
    recentActivity: [],
  });
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!user) return;
    getDashboardStats(user.uid).then(setStats);
  }, [user, cases]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToReminders(user.uid, setReminders);
    return unsub;
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const recentCases = cases.slice(0, 5);

  // Get today's and upcoming reminders
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const todayReminders = reminders.filter((r) => {
    const due = r.dueDate?.toDate?.();
    return due && due <= todayEnd;
  });
  const upcomingReminders = reminders
    .filter((r) => {
      const due = r.dueDate?.toDate?.();
      return due && due > todayEnd;
    })
    .slice(0, 3);

  const handleDismissReminder = async (reminderId: string) => {
    if (!user) return;
    await dismissReminder(user.uid, reminderId);
  };

  const entryTypeIcon = (type: string) => {
    switch (type) {
      case "observation":
        return "🩺";
      case "treatment":
        return "💉";
      case "medication":
        return "💊";
      case "procedure":
        return "🏥";
      case "lab-result":
        return "🔬";
      case "imaging":
        return "🖼️";
      case "complication":
        return "⚠️";
      default:
        return "📋";
    }
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          bg: "bg-emerald-50 dark:bg-emerald-950/50",
          text: "text-emerald-700 dark:text-emerald-300",
          dot: "bg-emerald-500",
        };
      case "discharged":
        return {
          label: "Discharged",
          bg: "bg-purple-50 dark:bg-purple-950/50",
          text: "text-purple-700 dark:text-purple-300",
          dot: "bg-purple-500",
        };
      case "follow-up":
        return {
          label: "Follow-up",
          bg: "bg-amber-50 dark:bg-amber-950/50",
          text: "text-amber-700 dark:text-amber-300",
          dot: "bg-amber-500",
        };
      default:
        return {
          label: status,
          bg: "bg-gray-50 dark:bg-gray-900",
          text: "text-gray-700 dark:text-gray-300",
          dot: "bg-gray-500",
        };
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-60" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-blue-100 mb-1">{todayStr}</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {greeting()}, Dr. {doctor?.displayName?.split(" ")[0] ?? ""}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-blue-100">
              {doctor?.specialization && (
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {doctor.specialization}
                </span>
              )}
              {doctor?.hospital && (
                <span className="flex items-center gap-1">
                  <span className="hidden sm:inline">·</span>
                  {doctor.hospital}
                </span>
              )}
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary-700 hover:bg-blue-50 shadow-lg shadow-blue-900/20 font-semibold w-full sm:w-auto"
          >
            <Link to="/cases/new">
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Active
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {stats.activeCases}
                  </span>
                  {stats.thisWeekNewCases > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" />+
                      {stats.thisWeekNewCases} this week
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Total Cases
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stats.totalCases}</span>
                  {stats.thisMonthNewCases > 0 && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      +{stats.thisMonthNewCases} this month
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Today's Entries
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {stats.todayEntries}
                  </span>
                  {stats.lastEntryTime && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Last at {formatTime(stats.lastEntryTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Case Studies
                </p>
                <span className="text-2xl font-bold">{stats.caseStudies}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Grid: Left (Recent Cases + Activity) / Right (Schedule + Pulse) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column — 2/3 width */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Recent Cases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Recent Cases</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/cases"
                  className="text-primary-600 dark:text-primary-400"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[72px] bg-[hsl(var(--muted))] animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : recentCases.length === 0 ? (
                <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                  <ClipboardList className="mx-auto h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm">
                    No cases yet. Create your first case to get started.
                  </p>
                  <Button asChild className="mt-4" size="sm">
                    <Link to="/cases/new">
                      <Plus className="mr-2 h-4 w-4" />
                      New Case
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentCases.map((c) => {
                    const sc = statusConfig(c.status);
                    return (
                      <Link
                        key={c.id}
                        to={`/cases/${c.id}`}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]/50 transition-all duration-200"
                      >
                        {/* Status dot */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${sc.dot} ring-4 ring-opacity-20 ${sc.dot.replace("bg-", "ring-")}`}
                          />
                        </div>
                        {/* Patient info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate">
                              {c.patient.name}
                            </span>
                            <span className="text-xs text-[hsl(var(--muted-foreground))] hidden sm:inline">
                              {c.patient.age}
                              {c.patient.gender?.[0]?.toUpperCase()}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${sc.bg} ${sc.text} border-0 font-medium`}
                            >
                              {sc.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
                            {c.admission.initialDiagnosis}
                          </p>
                        </div>
                        {/* Meta */}
                        <div className="hidden sm:flex flex-col items-end text-right shrink-0">
                          <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                            {c.caseNumber}
                          </span>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {c.admission.date
                              ? formatDate(
                                  (c.admission.date as Timestamp).toDate(),
                                )
                              : ""}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {stats.recentActivity.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[hsl(var(--border))]" />

                  <div className="space-y-4">
                    {stats.recentActivity.map((act, i) => (
                      <Link
                        key={i}
                        to={`/cases/${act.caseId}`}
                        className="relative flex items-start gap-4 group"
                      >
                        <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] flex items-center justify-center text-sm group-hover:border-primary-400 transition-colors">
                          {entryTypeIcon(act.entryType)}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm font-medium truncate">
                            {act.entryTitle}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {act.patientName} · {act.caseNumber}
                          </p>
                        </div>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0 pt-1">
                          {formatTime(act.time)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column — 1/3 width */}
        <div className="space-y-4 sm:space-y-6">
          {/* Today's Schedule (Reminders) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-500" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {todayReminders.length === 0 && upcomingReminders.length === 0 ? (
                <div className="text-center py-6 text-[hsl(var(--muted-foreground))]">
                  <Calendar className="mx-auto h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No upcoming reminders</p>
                  <p className="text-xs mt-1">Add reminders from case pages</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayReminders.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Today
                      </p>
                      {todayReminders.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30"
                        >
                          <div className="shrink-0 mt-0.5">
                            <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {r.title}
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                              {r.patientName}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                              {r.dueDate?.toDate &&
                                formatTime(r.dueDate.toDate())}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDismissReminder(r.id);
                            }}
                            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] shrink-0"
                          >
                            Done
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {upcomingReminders.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Upcoming
                      </p>
                      {upcomingReminders.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--muted))]/50"
                        >
                          <div className="shrink-0 mt-0.5">
                            <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {r.title}
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                              {r.patientName}
                            </p>
                          </div>
                          <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">
                            {r.dueDate?.toDate &&
                              formatDate(r.dueDate.toDate())}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Pulse */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-500" />
                Case Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted))]/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm">Active Cases</span>
                  </div>
                  <span className="text-sm font-bold">{stats.activeCases}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted))]/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm">Follow-ups</span>
                  </div>
                  <span className="text-sm font-bold">
                    {stats.followUpCases}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted))]/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm">Discharged</span>
                  </div>
                  <span className="text-sm font-bold">
                    {stats.dischargedCases}
                  </span>
                </div>
                {stats.criticalEntriesToday > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        Critical Today
                      </span>
                    </div>
                    <span className="text-sm font-bold text-red-700 dark:text-red-300">
                      {stats.criticalEntriesToday}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-auto py-3 flex-col gap-1.5"
                >
                  <Link to="/cases/new">
                    <Plus className="h-4 w-4 text-primary-500" />
                    <span className="text-xs">New Case</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-auto py-3 flex-col gap-1.5"
                >
                  <Link to="/cases">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-xs">All Cases</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-auto py-3 flex-col gap-1.5"
                >
                  <Link to="/search">
                    <ClipboardList className="h-4 w-4 text-amber-500" />
                    <span className="text-xs">Search</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-auto py-3 flex-col gap-1.5"
                >
                  <Link to="/profile">
                    <Stethoscope className="h-4 w-4 text-purple-500" />
                    <span className="text-xs">Profile</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
