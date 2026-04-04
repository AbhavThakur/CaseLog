import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  Calendar as CalendarIcon,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptySearchIllustration } from "@/components/illustrations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { searchCases } from "@/lib/firestore";
import type { PatientCase } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

const OUTCOME_OPTIONS = [
  { value: "all", label: "All Outcomes" },
  { value: "recovered", label: "Recovered" },
  { value: "improved", label: "Improved" },
  { value: "LAMA", label: "LAMA" },
  { value: "referred", label: "Referred" },
  { value: "expired", label: "Expired" },
];

const VISIT_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "ipd", label: "IPD" },
  { value: "opd", label: "OPD" },
];

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<PatientCase[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (outcomeFilter !== "all") count++;
    if (visitTypeFilter !== "all") count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (tagFilter) count++;
    return count;
  }, [
    statusFilter,
    outcomeFilter,
    visitTypeFilter,
    dateFrom,
    dateTo,
    tagFilter,
  ]);

  const handleSearch = async () => {
    if (!user) return;
    setLoading(true);
    setSearched(true);
    try {
      let cases = await searchCases(user.uid, query, statusFilter);

      if (outcomeFilter !== "all") {
        cases = cases.filter((c) => c.discharge?.outcome === outcomeFilter);
      }
      if (visitTypeFilter !== "all") {
        cases = cases.filter((c) => c.admission.visitType === visitTypeFilter);
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        cases = cases.filter((c) => {
          const d = (c.admission.date as Timestamp)?.toDate?.();
          return d && d >= from;
        });
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        cases = cases.filter((c) => {
          const d = (c.admission.date as Timestamp)?.toDate?.();
          return d && d <= to;
        });
      }
      if (tagFilter) {
        const tags = tagFilter
          .toLowerCase()
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        cases = cases.filter((c) =>
          tags.some((tag) =>
            c.tags.some((ct) => ct.toLowerCase().includes(tag)),
          ),
        );
      }
      setResults(cases);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setOutcomeFilter("all");
    setVisitTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setTagFilter("");
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    results.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [results]);

  const statusConfig = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "discharged":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "follow-up":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Search Cases</h1>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-1.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search name, diagnosis, tag, case number..."
            className="pl-10 rounded-xl h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-xl h-11 px-5"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {showFilters && (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Advanced Filters</p>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Outcome</Label>
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTCOME_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Visit Type</Label>
                <Select
                  value={visitTypeFilter}
                  onValueChange={setVisitTypeFilter}
                >
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> From
                </Label>
                <Input
                  type="date"
                  className="h-9 rounded-lg text-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> To
                </Label>
                <Input
                  type="date"
                  className="h-9 rounded-lg text-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input
                  className="h-9 rounded-lg text-sm"
                  placeholder="cardiac, ICU..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))] mr-1 self-center">
                  Tags:
                </span>
                {allTags.slice(0, 10).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      const current = tagFilter
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      if (!current.includes(t))
                        setTagFilter(current.length ? `${tagFilter}, ${t}` : t);
                    }}
                    className="px-2 py-0.5 text-xs rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searched && (
        <div className="space-y-2">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          {results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10 text-[hsl(var(--muted-foreground))]">
                <EmptySearchIllustration className="w-32 h-32 mx-auto mb-1" />
                <p className="text-sm font-medium">No cases found</p>
                <p className="text-xs mt-1">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            results.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`} className="block group">
                <Card className="hover:border-[hsl(var(--primary))]/50 transition-all duration-200">
                  <CardContent className="py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusConfig(c.status)}`}
                        >
                          {c.status}
                        </Badge>
                        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                          {c.caseNumber}
                        </span>
                        {c.admission.visitType && (
                          <Badge variant="outline" className="text-[10px]">
                            {c.admission.visitType.toUpperCase()}
                          </Badge>
                        )}
                        {c.isCaseStudy && (
                          <Badge className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0">
                            Case Study
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">
                        {c.patient.name}
                        <span className="text-xs font-normal text-[hsl(var(--muted-foreground))] ml-2">
                          {c.patient.age}
                          {c.patient.gender?.[0]?.toUpperCase()} ·{" "}
                          {c.patient.bloodGroup ?? ""}
                        </span>
                      </h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
                        {c.admission.initialDiagnosis}
                        {c.admission.date &&
                          ` · ${formatDate((c.admission.date as Timestamp).toDate())}`}
                      </p>
                      {c.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {c.tags.slice(0, 5).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 text-[10px] rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                            >
                              {t}
                            </span>
                          ))}
                          {c.tags.length > 5 && (
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                              +{c.tags.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                      {c.discharge && (
                        <p className="text-[10px] mt-1 text-[hsl(var(--muted-foreground))]">
                          Outcome:{" "}
                          <span className="font-medium capitalize">
                            {c.discharge.outcome}
                          </span>
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
