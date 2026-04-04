import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  ClipboardList,
  Calendar,
  MapPin,
  FileDown,
  Heart,
  User,
  Phone,
  Droplets,
  Clock,
  AlertTriangle,
  ChevronRight,
  Pencil,
  Share2,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToCase,
  subscribeToTimeline,
  subscribeToVitals,
  updateCase,
  createShareLink,
} from "@/lib/firestore";
import type { PatientCase, TimelineEntry, VitalsRecord } from "@/lib/types";
import {
  formatDate,
  formatTime,
  getDaysSince,
  getEntryTypeIcon,
} from "@/lib/utils";
import { TimelineEntryForm } from "@/components/cases/TimelineEntryForm";
import { DischargeForm } from "@/components/cases/DischargeForm";
import { VitalsChart } from "@/components/cases/VitalsChart";
import { VitalsBodyMap } from "@/components/cases/VitalsBodyMap";
import { FilePreview } from "@/components/FilePreview";
import { QuickPhotoCapture } from "@/components/cases/QuickPhotoCapture";
import { ReminderForm } from "@/components/cases/ReminderForm";
import { exportCasePDF } from "@/lib/pdf-export";
import type { Timestamp } from "firebase/firestore";

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { user, doctor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patientCase, setPatientCase] = useState<PatientCase | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editEntry, setEditEntry] = useState<TimelineEntry | null>(null);
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewAttachments, setPreviewAttachments] = useState<
    { name: string; url: string; type: "image" | "pdf" | "document" }[]
  >([]);

  useEffect(() => {
    if (!user || !caseId) return;

    const unsub1 = subscribeToCase(user.uid, caseId, (c) => {
      setPatientCase(c);
      setLoading(false);
    });

    const unsub2 = subscribeToTimeline(user.uid, caseId, setTimeline);
    const unsub3 = subscribeToVitals(user.uid, caseId, setVitals);

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user, caseId]);

  const filteredTimeline =
    typeFilter === "all"
      ? timeline
      : timeline.filter((e) => e.type === typeFilter);

  const toggleCaseStudy = async () => {
    if (!user || !caseId || !patientCase) return;
    await updateCase(user.uid, caseId, {
      isCaseStudy: !patientCase.isCaseStudy,
    });
    toast({
      title: patientCase.isCaseStudy
        ? "Removed from case studies"
        : "Marked as case study",
    });
  };

  const handleShare = async () => {
    if (!user || !caseId) return;
    setSharing(true);
    try {
      const shareId = await createShareLink(
        user.uid,
        caseId,
        doctor?.displayName ?? "Doctor",
        30,
        doctor?.photoURL ?? undefined,
      );
      const url = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Read-only link valid for 30 days. Copied to clipboard.",
      });
    } catch (err) {
      console.error("Share link error:", err);
      toast({
        title: "Failed to create share link",
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const openPreview = (
    attachments: {
      name: string;
      url: string;
      type: "image" | "pdf" | "document";
    }[],
    index: number,
  ) => {
    setPreviewAttachments(attachments);
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (!patientCase) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          Case not found.
        </p>
        <Button asChild className="mt-4">
          <Link to="/cases">Back to Cases</Link>
        </Button>
      </div>
    );
  }

  const admDate = patientCase.admission.date
    ? (patientCase.admission.date as Timestamp).toDate()
    : new Date();

  const statusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          bg: "bg-emerald-50 dark:bg-emerald-950/50",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800/40",
          dot: "bg-emerald-500",
          ring: "ring-emerald-500/20",
        };
      case "discharged":
        return {
          label: "Discharged",
          bg: "bg-purple-50 dark:bg-purple-950/50",
          text: "text-purple-700 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-800/40",
          dot: "bg-purple-500",
          ring: "ring-purple-500/20",
        };
      case "follow-up":
        return {
          label: "Follow-up",
          bg: "bg-amber-50 dark:bg-amber-950/50",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800/40",
          dot: "bg-amber-500",
          ring: "ring-amber-500/20",
        };
      default:
        return {
          label: status,
          bg: "bg-gray-50 dark:bg-gray-900",
          text: "text-gray-700 dark:text-gray-300",
          border: "border-gray-200 dark:border-gray-800",
          dot: "bg-gray-500",
          ring: "ring-gray-500/20",
        };
    }
  };

  const priorityConfig = (priority: string) => {
    switch (priority) {
      case "critical":
        return {
          badge: (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
              <AlertTriangle className="h-3 w-3" />
              Critical
            </span>
          ),
        };
      case "important":
        return {
          badge: (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              Important
            </span>
          ),
        };
      default:
        return { badge: null };
    }
  };

  // Group timeline entries by date
  const groupedTimeline = filteredTimeline.reduce<
    Record<string, TimelineEntry[]>
  >((groups, entry) => {
    const date = entry.entryDate
      ? formatDate((entry.entryDate as Timestamp).toDate())
      : "Unknown Date";
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});

  const sc = statusConfig(patientCase.status);

  // Latest vitals for the quick-glance cards
  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-8">
      {/* ── Back Navigation ── */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          onClick={() => navigate("/cases")}
        >
          <ArrowLeft className="h-4 w-4" />
          Cases
        </Button>
        <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
        <span className="text-sm font-mono text-[hsl(var(--muted-foreground))]">
          {patientCase.caseNumber}
        </span>
      </div>

      {/* ── Patient Header Card ── */}
      <Card className={`overflow-hidden border ${sc.border}`}>
        {/* Colored top stripe */}
        <div className={`h-1.5 ${sc.dot}`} />
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col gap-5">
            {/* Top row: Patient info + Status + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Patient Avatar */}
                <div
                  className={`shrink-0 w-14 h-14 rounded-2xl ${sc.bg} flex items-center justify-center`}
                >
                  <User className={`h-6 w-6 ${sc.text}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {patientCase.patient.name}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                    {patientCase.admission.visitType && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-semibold tracking-wider"
                      >
                        {patientCase.admission.visitType}
                      </Badge>
                    )}
                    {patientCase.isCaseStudy && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <BookOpen className="h-3 w-3" />
                        Case Study
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-[hsl(var(--muted-foreground))] flex-wrap">
                    <span className="flex items-center gap-1">
                      {patientCase.patient.age}
                      {patientCase.patient.gender === "male"
                        ? "M"
                        : patientCase.patient.gender === "female"
                          ? "F"
                          : ""}
                    </span>
                    {patientCase.patient.bloodGroup && (
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" />
                        {patientCase.patient.bloodGroup}
                      </span>
                    )}
                    {patientCase.patient.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {patientCase.patient.phone}
                      </span>
                    )}
                    {patientCase.patient.smokingStatus && (
                      <span className="flex items-center gap-1">
                        🚬{" "}
                        {patientCase.patient.smokingStatus === "current"
                          ? "Current Smoker"
                          : patientCase.patient.smokingStatus === "former"
                            ? "Former Smoker"
                            : "Never Smoked"}
                      </span>
                    )}
                  </div>
                  {patientCase.patient.clinicalHistory && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-2">
                      <span className="font-medium">Hx:</span>{" "}
                      {patientCase.patient.clinicalHistory}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={handleShare}
                  disabled={sharing}
                >
                  <Share2 className="mr-1.5 h-3.5 w-3.5" />
                  {sharing ? "…" : "Share"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => exportCasePDF(patientCase, timeline, doctor)}
                >
                  <FileDown className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>
                {patientCase.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setShowDischargeForm(true)}
                  >
                    Discharge
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={toggleCaseStudy}
                >
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  {patientCase.isCaseStudy ? "Unmark" : "Case Study"}
                </Button>
                <ReminderForm
                  caseId={caseId!}
                  patientName={patientCase.patient.name}
                  patientPhone={patientCase.patient.phone}
                />
              </div>
            </div>

            <Separator />

            {/* Info Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  {patientCase.admission.visitType === "opd"
                    ? "Visit Date"
                    : "Admitted"}
                </p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  {formatDate(admDate)}
                </p>
              </div>
              {patientCase.status === "active" &&
                patientCase.admission.visitType === "ipd" && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Duration
                    </p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                      Day {getDaysSince(admDate) + 1}
                    </p>
                  </div>
                )}
              {patientCase.admission.ward && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                    {patientCase.admission.ward}
                    {patientCase.admission.roomNumber &&
                      `, Rm ${patientCase.admission.roomNumber}`}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Entries
                </p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  {timeline.length} entries
                </p>
              </div>
            </div>

            {/* Diagnosis Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Chief Complaint
                </p>
                <p className="text-sm">
                  {patientCase.admission.chiefComplaint}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50/80 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30">
                <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                  Diagnosis
                </p>
                <p className="text-sm">
                  {patientCase.admission.initialDiagnosis}
                </p>
              </div>
            </div>

            {/* Tags */}
            {patientCase.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {patientCase.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs rounded-full"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Vitals Glance — Glassmorphism ── */}
      {latestVitals && (
        <div className="rounded-3xl bg-med-night p-5 sm:p-6 relative overflow-hidden">
          {/* Ambient glow blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-hyper-blue/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-hyper-blue/5 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <Heart className="h-4 w-4 text-hyper-blue" />
                Latest Vitals
              </h3>
              <div className="flex items-center gap-3">
                {latestVitals.recordedAt && (
                  <span className="text-xs text-white/40">
                    {formatTime(latestVitals.recordedAt.toDate())}
                  </span>
                )}
                <button
                  onClick={() => setShowBodyMap(true)}
                  className="text-xs text-hyper-blue hover:text-hyper-blue/80 font-semibold transition-colors flex items-center gap-1"
                >
                  View All
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {latestVitals.bloodPressureSystolic &&
                latestVitals.bloodPressureDiastolic && (
                  <div className="glass-card rounded-3xl p-4 group hover:glow-blue transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emergency-ruby/20 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-emergency-ruby" />
                      </div>
                      <span className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">
                        Blood Pressure
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {latestVitals.bloodPressureSystolic}
                      <span className="text-base text-white/40">
                        /{latestVitals.bloodPressureDiastolic}
                      </span>
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">mmHg</p>
                  </div>
                )}

              {latestVitals.pulse && (
                <div
                  className={`glass-card rounded-3xl p-4 transition-all duration-300 ${
                    latestVitals.pulse > 100 || latestVitals.pulse < 60
                      ? "glow-ruby border-emergency-ruby/30"
                      : "hover:glow-blue"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        latestVitals.pulse > 100 || latestVitals.pulse < 60
                          ? "bg-emergency-ruby/20"
                          : "bg-hyper-blue/20"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          latestVitals.pulse > 100 || latestVitals.pulse < 60
                            ? "text-emergency-ruby animate-pulse"
                            : "text-hyper-blue"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">
                      Heart Rate
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p
                      className={`text-2xl font-bold tracking-tight ${
                        latestVitals.pulse > 100 || latestVitals.pulse < 60
                          ? "text-emergency-ruby"
                          : "text-hyper-blue"
                      }`}
                    >
                      {latestVitals.pulse}
                    </p>
                    <span className="text-xs text-white/40">bpm</span>
                  </div>
                  {/* Mini pulse line */}
                  <div className="mt-2 flex items-end gap-px h-4">
                    {[3, 8, 5, 12, 4, 9, 6, 14, 5, 7, 3, 10, 6, 8].map(
                      (h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full ${
                            latestVitals.pulse &&
                            (latestVitals.pulse > 100 ||
                              latestVitals.pulse < 60)
                              ? "bg-emergency-ruby/50"
                              : "bg-hyper-blue/40"
                          }`}
                          style={{ height: `${h}px` }}
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

              {latestVitals.spO2 != null && (
                <div
                  className={`glass-card rounded-3xl p-4 transition-all duration-300 ${
                    latestVitals.spO2 < 95
                      ? "glow-ruby border-emergency-ruby/30"
                      : "hover:glow-blue"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        latestVitals.spO2 < 95
                          ? "bg-emergency-ruby/20"
                          : "bg-cyan-500/20"
                      }`}
                    >
                      <Droplets
                        className={`h-4 w-4 ${
                          latestVitals.spO2 < 95
                            ? "text-emergency-ruby"
                            : "text-cyan-400"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">
                      SpO2
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <p
                      className={`text-2xl font-bold tracking-tight ${
                        latestVitals.spO2 < 95
                          ? "text-emergency-ruby"
                          : "text-white"
                      }`}
                    >
                      {latestVitals.spO2}
                    </p>
                    <span className="text-sm text-white/40">%</span>
                  </div>
                  {/* SpO2 ring */}
                  <div className="mt-2 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        latestVitals.spO2 < 95
                          ? "bg-emergency-ruby"
                          : "bg-cyan-400"
                      }`}
                      style={{ width: `${latestVitals.spO2}%` }}
                    />
                  </div>
                </div>
              )}

              {latestVitals.temperature && (
                <div
                  className={`glass-card rounded-3xl p-4 transition-all duration-300 ${
                    latestVitals.temperature > 38.5
                      ? "glow-ruby border-emergency-ruby/30"
                      : "hover:glow-blue"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        latestVitals.temperature > 38.5
                          ? "bg-emergency-ruby/20"
                          : "bg-orange-500/20"
                      }`}
                    >
                      <svg
                        className={`h-4 w-4 ${latestVitals.temperature > 38.5 ? "text-emergency-ruby" : "text-orange-400"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">
                      Temperature
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <p
                      className={`text-2xl font-bold tracking-tight ${
                        latestVitals.temperature > 38.5
                          ? "text-emergency-ruby"
                          : "text-white"
                      }`}
                    >
                      {latestVitals.temperature}
                    </p>
                    <span className="text-sm text-white/40">°C</span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">
                    {latestVitals.temperature <= 36.5
                      ? "Below normal"
                      : latestVitals.temperature <= 37.5
                        ? "Normal range"
                        : latestVitals.temperature <= 38.5
                          ? "Low fever"
                          : "High fever"}
                  </p>
                </div>
              )}

              {latestVitals.respiratoryRate != null && (
                <div
                  className={`glass-card rounded-3xl p-4 transition-all duration-300 ${
                    latestVitals.respiratoryRate > 24 ||
                    latestVitals.respiratoryRate < 12
                      ? "glow-ruby border-emergency-ruby/30"
                      : "hover:glow-blue"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        latestVitals.respiratoryRate > 24 ||
                        latestVitals.respiratoryRate < 12
                          ? "bg-emergency-ruby/20"
                          : "bg-teal-500/20"
                      }`}
                    >
                      <Wind
                        className={`h-4 w-4 ${
                          latestVitals.respiratoryRate > 24 ||
                          latestVitals.respiratoryRate < 12
                            ? "text-emergency-ruby"
                            : "text-teal-400"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">
                      Resp Rate
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p
                      className={`text-2xl font-bold tracking-tight ${
                        latestVitals.respiratoryRate > 24 ||
                        latestVitals.respiratoryRate < 12
                          ? "text-emergency-ruby"
                          : "text-white"
                      }`}
                    >
                      {latestVitals.respiratoryRate}
                    </p>
                    <span className="text-xs text-white/40">br/min</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Investigations & Reports ── */}
      {patientCase.investigations &&
        Object.values(patientCase.investigations).some(Boolean) && (
          <Card className="border-violet-200 dark:border-violet-800/40 overflow-hidden">
            <div className="h-1 bg-violet-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                Investigations & Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {patientCase.investigations.chestXrayFindings && (
                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/10">
                  <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                    Chest X-ray
                  </p>
                  <p>{patientCase.investigations.chestXrayFindings}</p>
                </div>
              )}
              {patientCase.investigations.ctFindings && (
                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/10">
                  <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                    CT Findings
                  </p>
                  <p>{patientCase.investigations.ctFindings}</p>
                </div>
              )}
              {patientCase.investigations.interventionDone && (
                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/10">
                  <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                    Intervention Done
                  </p>
                  <p>{patientCase.investigations.interventionDone}</p>
                </div>
              )}
              {patientCase.investigations.procedureFindings && (
                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/10">
                  <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                    Procedure Findings
                  </p>
                  <p>{patientCase.investigations.procedureFindings}</p>
                </div>
              )}
              {patientCase.investigations.balReport && (
                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/10">
                  <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                    BAL Report
                  </p>
                  <p>{patientCase.investigations.balReport}</p>
                </div>
              )}
              {patientCase.investigations.histopathReport && (
                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/10">
                  <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                    Histopathology Report
                  </p>
                  <p>{patientCase.investigations.histopathReport}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* ── Follow-Up Visits ── */}
      {patientCase.followUps && patientCase.followUps.length > 0 && (
        <Card className="border-teal-200 dark:border-teal-800/40 overflow-hidden">
          <div className="h-1 bg-teal-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Follow-Up Visits ({patientCase.followUps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {patientCase.followUps.map((fu, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/10 flex gap-3"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-0.5">
                    {fu.date?.toDate
                      ? fu.date.toDate().toLocaleDateString()
                      : "—"}
                  </p>
                  <p>{fu.notes}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Discharge Summary ── */}
      {patientCase.discharge && (
        <Card className="border-purple-200 dark:border-purple-800/40 overflow-hidden">
          <div className="h-1 bg-purple-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Discharge Summary
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 capitalize">
                {patientCase.discharge.outcome}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/10">
              <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                Final Diagnosis
              </p>
              <p>{patientCase.discharge.finalDiagnosis}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/10">
              <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                Treatment Summary
              </p>
              <p>{patientCase.discharge.treatmentSummary}</p>
            </div>
            {patientCase.discharge.followUpInstructions && (
              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/10">
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                  Follow-up
                </p>
                <p>{patientCase.discharge.followUpInstructions}</p>
              </div>
            )}
            {patientCase.discharge.medications &&
              patientCase.discharge.medications.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/10">
                  <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                    Medications
                  </p>
                  <p>{patientCase.discharge.medications.join(", ")}</p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="timeline">
        <TabsList className="grid w-full grid-cols-3 rounded-xl h-11">
          <TabsTrigger
            value="timeline"
            className="text-xs sm:text-sm rounded-lg"
          >
            Timeline ({timeline.length})
          </TabsTrigger>
          <TabsTrigger value="vitals" className="text-xs sm:text-sm rounded-lg">
            Vitals
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="text-xs sm:text-sm rounded-lg"
          >
            Gallery
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="observation">🩺 Observation</SelectItem>
                <SelectItem value="treatment">💉 Treatment</SelectItem>
                <SelectItem value="medication">💊 Medication</SelectItem>
                <SelectItem value="procedure">🏥 Procedure</SelectItem>
                <SelectItem value="lab-result">🔬 Lab Result</SelectItem>
                <SelectItem value="imaging">🖼️ Imaging</SelectItem>
                <SelectItem value="note">📋 Note</SelectItem>
                <SelectItem value="complication">⚠️ Complication</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowEntryForm(true)}
              className="w-full sm:w-auto rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>

          {filteredTimeline.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                <ClipboardList className="mx-auto h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No timeline entries yet.</p>
                <Button
                  className="mt-3 rounded-xl"
                  size="sm"
                  onClick={() => setShowEntryForm(true)}
                >
                  Add First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedTimeline).map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <Separator className="flex-1" />
                  <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap uppercase tracking-wider bg-[hsl(var(--background))] px-2">
                    {date}
                  </span>
                  <Separator className="flex-1" />
                </div>
                <div className="space-y-3 relative before:absolute before:left-[18px] sm:before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-[hsl(var(--border))]">
                  {entries.map((entry) => (
                    <div key={entry.id} className="relative pl-10 sm:pl-12">
                      <div className="absolute left-2 sm:left-3 top-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] flex items-center justify-center text-[10px] sm:text-xs z-10">
                        {getEntryTypeIcon(entry.type)}
                      </div>
                      <Card className="rounded-xl hover:shadow-sm transition-shadow">
                        <CardContent className="py-3 px-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                                  {entry.entryDate
                                    ? formatTime(
                                        (entry.entryDate as Timestamp).toDate(),
                                      )
                                    : ""}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] capitalize">
                                  {entry.type.replace("-", " ")}
                                </span>
                                {priorityConfig(entry.priority).badge}
                                <button
                                  type="button"
                                  title="Edit entry"
                                  onClick={() => {
                                    setEditEntry(entry);
                                    setShowEntryForm(true);
                                  }}
                                  className="ml-auto p-1 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                              <h4 className="font-semibold text-sm">
                                {entry.title}
                              </h4>
                              {entry.description && (
                                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                                  {entry.description}
                                </p>
                              )}
                              {/* Vitals snapshot */}
                              {entry.vitals && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {entry.vitals.bloodPressure && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300">
                                      <Heart className="h-3 w-3" />{" "}
                                      {entry.vitals.bloodPressure}
                                    </span>
                                  )}
                                  {entry.vitals.pulse && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                                      HR: {entry.vitals.pulse} bpm
                                    </span>
                                  )}
                                  {entry.vitals.temperature && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300">
                                      Temp: {entry.vitals.temperature}°
                                    </span>
                                  )}
                                  {entry.vitals.spO2 && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300">
                                      SpO2: {entry.vitals.spO2}%
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Attachments */}
                              {entry.attachments &&
                                entry.attachments.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {entry.attachments.map((att, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() =>
                                          openPreview(entry.attachments, i)
                                        }
                                        className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:underline bg-[hsl(var(--accent))] px-2.5 py-1 rounded-lg cursor-pointer transition-colors hover:bg-[hsl(var(--accent))]/80"
                                      >
                                        {att.type === "image"
                                          ? "🖼️"
                                          : att.type === "pdf"
                                            ? "📄"
                                            : "📎"}{" "}
                                        {att.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="mt-4">
          <VitalsChart vitals={vitals} />
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-4">
          <Card className="rounded-xl">
            <CardContent className="py-6">
              {(() => {
                const allAttachments = timeline.flatMap((e) =>
                  (e.attachments ?? []).map((a) => ({
                    ...a,
                    entryTitle: e.title,
                  })),
                );
                if (allAttachments.length === 0) {
                  return (
                    <p className="text-center text-[hsl(var(--muted-foreground))]">
                      No files attached yet.
                    </p>
                  );
                }
                const images = allAttachments.filter((a) => a.type === "image");
                const pdfs = allAttachments.filter((a) => a.type === "pdf");

                return (
                  <div className="space-y-6">
                    {images.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          Photos ({images.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {images.map((att, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => openPreview(images, i)}
                              className="group relative aspect-square rounded-lg overflow-hidden bg-[hsl(var(--muted))] cursor-pointer"
                            >
                              <img
                                src={att.url}
                                alt={att.name}
                                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                loading="lazy"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                                <p className="text-xs text-white truncate">
                                  {att.name}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {pdfs.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          Documents ({pdfs.length})
                        </h3>
                        <div className="space-y-2">
                          {pdfs.map((att, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => openPreview(pdfs, i)}
                              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/80 transition-colors"
                            >
                              <span className="text-lg">📄</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {att.name}
                                </p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                  {att.entryTitle}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Timeline Entry Form Dialog */}
      {showEntryForm && caseId && (
        <TimelineEntryForm
          open={showEntryForm}
          onClose={() => {
            setShowEntryForm(false);
            setEditEntry(null);
          }}
          caseId={caseId}
          editEntry={editEntry}
        />
      )}

      {/* Discharge Form Dialog */}
      {showDischargeForm && caseId && (
        <DischargeForm
          open={showDischargeForm}
          onClose={() => setShowDischargeForm(false)}
          caseId={caseId}
          patientCase={patientCase}
          timeline={timeline}
        />
      )}

      {/* File Preview Lightbox */}
      <FilePreview
        attachments={previewAttachments}
        initialIndex={previewIndex}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* Quick Photo Capture FAB */}
      {patientCase.status === "active" && caseId && (
        <QuickPhotoCapture caseId={caseId} />
      )}

      {/* Vitals Body Map Overlay */}
      {showBodyMap && (
        <VitalsBodyMap
          vitals={vitals}
          patient={patientCase.patient}
          onClose={() => setShowBodyMap(false)}
        />
      )}
    </div>
  );
}
