import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, ChevronRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCases } from "@/hooks/useCases";
import { formatDate, getDaysSince } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

export default function CasesPage() {
  const { loading, filterCases } = useCases();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCases = filterCases(search, statusFilter);

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

  // Count by status
  const allCases = filterCases("", "all");
  const activeCnt = allCases.filter((c) => c.status === "active").length;
  const dischargedCnt = allCases.filter(
    (c) => c.status === "discharged",
  ).length;
  const followUpCnt = allCases.filter((c) => c.status === "follow-up").length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Cases</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            {allCases.length} total · {activeCnt} active
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto rounded-xl">
          <Link to="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { value: "all", label: "All", count: allCases.length },
          { value: "active", label: "Active", count: activeCnt },
          { value: "discharged", label: "Discharged", count: dischargedCnt },
          { value: "follow-up", label: "Follow-up", count: followUpCnt },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              statusFilter === s.value
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                : "bg-[hsl(var(--muted))]/70 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            }`}
          >
            {s.label}
            <span
              className={`text-xs ${statusFilter === s.value ? "text-white/70" : "text-[hsl(var(--muted-foreground))]/60"}`}
            >
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Search by name, diagnosis, case number, tag..."
          className="pl-10 rounded-xl h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[88px] bg-[hsl(var(--muted))] animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="text-center py-16 text-[hsl(var(--muted-foreground))]">
            <User className="mx-auto h-12 w-12 mb-3 opacity-15" />
            <p className="text-base font-medium">No cases found</p>
            <p className="mt-1 text-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first case to get started."}
            </p>
            {!search && statusFilter === "all" && (
              <Button asChild className="mt-4 rounded-xl">
                <Link to="/cases/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Case
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredCases.map((c) => {
            const sc = statusConfig(c.status);
            return (
              <Link key={c.id} to={`/cases/${c.id}`} className="block group">
                <Card className="rounded-xl border hover:border-[hsl(var(--primary))]/40 transition-all hover:shadow-sm">
                  <CardContent className="flex items-center gap-3 sm:gap-4 py-4 px-4 sm:px-5">
                    {/* Status indicator */}
                    <div className="shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                      </div>
                    </div>

                    {/* Patient info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                          {c.patient.name}
                        </h3>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {c.patient.age}
                          {c.patient.gender === "male"
                            ? "M"
                            : c.patient.gender === "female"
                              ? "F"
                              : ""}
                          {c.patient.bloodGroup
                            ? `, ${c.patient.bloodGroup}`
                            : ""}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text} border-0`}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
                        {c.admission.initialDiagnosis}
                      </p>
                      {c.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1.5">
                          {c.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] rounded-full px-2 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {c.tags.length > 3 && (
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                              +{c.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 text-right">
                      <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                        {c.caseNumber}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {c.admission.date
                          ? formatDate((c.admission.date as Timestamp).toDate())
                          : ""}
                      </span>
                      {c.status === "active" && c.admission.date && (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Day{" "}
                          {getDaysSince(
                            (c.admission.date as Timestamp).toDate(),
                          ) + 1}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
        Showing {filteredCases.length} of {allCases.length} cases
      </p>
    </div>
  );
}
