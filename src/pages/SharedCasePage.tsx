import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  ClipboardList,
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle,
  Lock,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSharedCase } from "@/lib/firestore";
import type { PatientCase, TimelineEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const priorityConfig = {
  normal: { label: "Normal", class: "" },
  important: {
    label: "Important",
    class: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
  },
  critical: {
    label: "Critical",
    class: "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
  },
};

const typeIcons: Record<string, string> = {
  observation: "🩺",
  treatment: "💉",
  medication: "💊",
  procedure: "🏥",
  "lab-result": "🔬",
  imaging: "🖼️",
  note: "📋",
  complication: "⚠️",
};

export default function SharedCasePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<PatientCase | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [sharedBy, setSharedBy] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    getSharedCase(shareId)
      .then((result) => {
        if (result) {
          setCaseData(result.case);
          setTimeline(result.timeline);
          setSharedBy(result.sharedBy);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="animate-pulse text-[hsl(var(--muted-foreground))]">
          Loading shared case...
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Lock className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
          <h1 className="text-xl font-bold mb-2">Link Expired or Invalid</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
            This shared case link is no longer valid. It may have expired or
            been revoked.
          </p>
          <Button asChild>
            <Link to="/login">Go to CaseLog</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const p = caseData.patient;
  const a = caseData.admission;
  const d = caseData.discharge;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="font-bold">CaseLog</span>
            <Badge variant="outline" className="text-[10px]">
              Read-Only
            </Badge>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Shared by Dr. {sharedBy}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Patient Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {p.name}
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  {p.age} years · {p.gender} · {p.bloodGroup ?? "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={
                    caseData.status === "active"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : caseData.status === "follow-up"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                        : "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
                  }
                >
                  {caseData.status}
                </Badge>
                <Badge variant="outline" className="uppercase text-[10px]">
                  {a.visitType}
                </Badge>
                {caseData.caseNumber && (
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {caseData.caseNumber}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
                  Chief Complaint
                </p>
                <p className="text-sm mt-1">{a.chiefComplaint}</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
                  Diagnosis
                </p>
                <p className="text-sm mt-1">{a.initialDiagnosis}</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
                  Admission Date
                </p>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {a.date ? formatDate(a.date.toDate()) : "—"}
                </p>
              </div>
              {a.ward && (
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
                    Ward / Room
                  </p>
                  <p className="text-sm mt-1">
                    {a.ward} {a.roomNumber ? `· Room ${a.roomNumber}` : ""}
                  </p>
                </div>
              )}
            </div>

            {caseData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[hsl(var(--border))]">
                <Tag className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                {caseData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discharge Summary */}
        {d && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-purple-500" />
                Discharge Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                    Final Diagnosis
                  </p>
                  <p>{d.finalDiagnosis}</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                    Outcome
                  </p>
                  <Badge variant="outline" className="capitalize mt-0.5">
                    {d.outcome}
                  </Badge>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                    Treatment Summary
                  </p>
                  <p>{d.treatmentSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline ({timeline.length} entries)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
                No timeline entries
              </p>
            ) : (
              <div className="space-y-3">
                {timeline.map((entry) => {
                  const pc =
                    priorityConfig[entry.priority] ?? priorityConfig.normal;
                  return (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border-l-4 border border-[hsl(var(--border))] ${pc.class}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span>{typeIcons[entry.type] ?? "📋"}</span>
                          <span className="font-medium text-sm">
                            {entry.title}
                          </span>
                          {entry.priority !== "normal" && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                entry.priority === "critical"
                                  ? "border-red-300 text-red-600"
                                  : "border-amber-300 text-amber-600"
                              }`}
                            >
                              {entry.priority === "critical" && (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {pc.label}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">
                          {entry.entryDate
                            ? formatDate(entry.entryDate.toDate())
                            : ""}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 whitespace-pre-wrap">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-[hsl(var(--muted-foreground))] pb-4">
          This is a read-only shared view. Patient data is protected.
        </p>
      </div>
    </div>
  );
}
