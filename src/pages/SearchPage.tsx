import { useState } from "react";
import { Link } from "react-router";
import { Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { searchCases } from "@/lib/firestore";
import type { PatientCase } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [results, setResults] = useState<PatientCase[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!user) return;
    setLoading(true);
    setSearched(true);
    try {
      const cases = await searchCases(user.uid, query, statusFilter);
      setResults(cases);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Search Cases</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search name, diagnosis, tag, case number..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="discharged">Discharged</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {searched && (
        <div className="space-y-2">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                No cases found matching your search.
              </CardContent>
            </Card>
          ) : (
            results.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`} className="block">
                <Card className="hover:border-[hsl(var(--primary))] transition-colors">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={
                          c.status === "active"
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : c.status === "discharged"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                              : ""
                        }
                      >
                        {c.status}
                      </Badge>
                      <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                        {c.caseNumber}
                      </span>
                    </div>
                    <h3 className="font-semibold">{c.patient.name}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {c.admission.initialDiagnosis}
                      {c.admission.date &&
                        ` • ${formatDate((c.admission.date as Timestamp).toDate())}`}
                    </p>
                    {c.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {c.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
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
