import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCases } from "@/hooks/useCases";
import { formatDate, getDaysSince } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

export default function CasesPage() {
  const { loading, filterCases } = useCases();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCases = filterCases(search, statusFilter);

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
        <h1 className="text-xl sm:text-2xl font-bold">All Cases</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search by name, diagnosis, case number..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="discharged">Discharged</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-[hsl(var(--muted))] animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <p className="text-lg font-medium">No cases found</p>
            <p className="mt-1">
              {search || statusFilter !== "all"
                ? "Try adjusting your search filters."
                : "Create your first case to get started."}
            </p>
            {!search && statusFilter === "all" && (
              <Button asChild className="mt-4">
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
          {filteredCases.map((c) => (
            <Link key={c.id} to={`/cases/${c.id}`} className="block">
              <Card className="hover:border-[hsl(var(--primary))] transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(c.status)}
                      <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
                        {c.caseNumber}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg truncate">
                      {c.patient.name}
                      <span className="text-xs sm:text-sm font-normal text-[hsl(var(--muted-foreground))] ml-2">
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
                    </h3>
                    <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {c.admission.initialDiagnosis}
                      {c.admission.date && (
                        <>
                          {" "}
                          • Admitted{" "}
                          {formatDate((c.admission.date as Timestamp).toDate())}
                        </>
                      )}
                      {c.status === "active" && c.admission.date && (
                        <>
                          {" "}
                          • Day{" "}
                          {getDaysSince(
                            (c.admission.date as Timestamp).toDate(),
                          ) + 1}
                        </>
                      )}
                    </p>
                    {c.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {c.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <p className="text-sm text-center text-[hsl(var(--muted-foreground))]">
        {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
