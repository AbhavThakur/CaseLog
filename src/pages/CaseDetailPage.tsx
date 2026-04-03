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
  const [showDischargeForm, setShowDischargeForm] = useState(false);
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

  const priorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Critical
          </Badge>
        );
      case "important":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Important
          </Badge>
        );
      default:
        return null;
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back & Case Number */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cases")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
          {patientCase.caseNumber}
        </span>
      </div>

      {/* Patient Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {patientCase.patient.name}
                </h1>
                {statusBadge(patientCase.status)}
                {patientCase.admission.visitType && (
                  <Badge variant="outline" className="text-xs uppercase">
                    {patientCase.admission.visitType}
                  </Badge>
                )}
                {patientCase.isCaseStudy && (
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    Case Study
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] flex-wrap">
                <span>
                  {patientCase.patient.age}
                  {patientCase.patient.gender === "male"
                    ? "M"
                    : patientCase.patient.gender === "female"
                      ? "F"
                      : ""}
                  {patientCase.patient.bloodGroup
                    ? `, ${patientCase.patient.bloodGroup}`
                    : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {patientCase.admission.visitType === "opd"
                    ? "Visit"
                    : "Admitted"}{" "}
                  {formatDate(admDate)}
                  {patientCase.status === "active" &&
                    patientCase.admission.visitType === "ipd" &&
                    ` • Day ${getDaysSince(admDate) + 1}`}
                </span>
                {patientCase.admission.ward && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {patientCase.admission.ward}
                    {patientCase.admission.roomNumber &&
                      `, Room ${patientCase.admission.roomNumber}`}
                  </span>
                )}
              </div>
              <p className="text-sm">
                <strong>Chief Complaint:</strong>{" "}
                {patientCase.admission.chiefComplaint}
              </p>
              <p className="text-sm">
                <strong>Diagnosis:</strong>{" "}
                {patientCase.admission.initialDiagnosis}
              </p>
              {patientCase.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {patientCase.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportCasePDF(patientCase, timeline, doctor?.displayName)
                }
              >
                <FileDown className="mr-1 h-4 w-4" />
                Export PDF
              </Button>
              {patientCase.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDischargeForm(true)}
                >
                  Discharge
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={toggleCaseStudy}>
                <BookOpen className="mr-1 h-4 w-4" />
                {patientCase.isCaseStudy ? "Unmark" : "Case Study"}
              </Button>
              <ReminderForm
                caseId={caseId!}
                patientName={patientCase.patient.name}
                patientPhone={patientCase.patient.phone}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discharge Info */}
      {patientCase.discharge && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Discharge Summary
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {patientCase.discharge.outcome}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Final Diagnosis:</strong>{" "}
              {patientCase.discharge.finalDiagnosis}
            </p>
            <p>
              <strong>Treatment Summary:</strong>{" "}
              {patientCase.discharge.treatmentSummary}
            </p>
            {patientCase.discharge.followUpInstructions && (
              <p>
                <strong>Follow-up:</strong>{" "}
                {patientCase.discharge.followUpInstructions}
              </p>
            )}
            {patientCase.discharge.medications &&
              patientCase.discharge.medications.length > 0 && (
                <p>
                  <strong>Medications:</strong>{" "}
                  {patientCase.discharge.medications.join(", ")}
                </p>
              )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline" className="text-xs sm:text-sm">
            Timeline ({timeline.length})
          </TabsTrigger>
          <TabsTrigger value="vitals" className="text-xs sm:text-sm">
            Vitals
          </TabsTrigger>
          <TabsTrigger value="gallery" className="text-xs sm:text-sm">
            Gallery
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="observation">Observation</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="lab-result">Lab Result</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="complication">Complication</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowEntryForm(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>

          {filteredTimeline.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                <ClipboardList className="mx-auto h-10 w-10 mb-2 opacity-30" />
                <p>No timeline entries yet.</p>
                <Button
                  className="mt-3"
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
                <div className="flex items-center gap-2 mb-3">
                  <Separator className="flex-1" />
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                    {date}
                  </span>
                  <Separator className="flex-1" />
                </div>
                <div className="space-y-3 relative before:absolute before:left-[18px] sm:before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-[hsl(var(--border))]">
                  {entries.map((entry) => (
                    <div key={entry.id} className="relative pl-10 sm:pl-12">
                      <div className="absolute left-2 sm:left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] flex items-center justify-center text-[10px] sm:text-xs z-10">
                        {getEntryTypeIcon(entry.type)}
                      </div>
                      <Card>
                        <CardContent className="py-3 px-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                  {entry.entryDate
                                    ? formatTime(
                                        (entry.entryDate as Timestamp).toDate(),
                                      )
                                    : ""}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {entry.type.replace("-", " ")}
                                </Badge>
                                {priorityBadge(entry.priority)}
                              </div>
                              <h4 className="font-semibold text-sm">
                                {entry.title}
                              </h4>
                              {entry.description && (
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                  {entry.description}
                                </p>
                              )}
                              {/* Vitals snapshot */}
                              {entry.vitals && (
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                                  {entry.vitals.bloodPressure && (
                                    <span>
                                      BP: {entry.vitals.bloodPressure}
                                    </span>
                                  )}
                                  {entry.vitals.pulse && (
                                    <span>HR: {entry.vitals.pulse} bpm</span>
                                  )}
                                  {entry.vitals.temperature && (
                                    <span>
                                      Temp: {entry.vitals.temperature}°
                                    </span>
                                  )}
                                  {entry.vitals.spO2 && (
                                    <span>SpO2: {entry.vitals.spO2}%</span>
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
                                        className="inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline bg-[hsl(var(--accent))] px-2 py-1 rounded cursor-pointer"
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
          <Card>
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
          onClose={() => setShowEntryForm(false)}
          caseId={caseId}
        />
      )}

      {/* Discharge Form Dialog */}
      {showDischargeForm && caseId && (
        <DischargeForm
          open={showDischargeForm}
          onClose={() => setShowDischargeForm(false)}
          caseId={caseId}
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
    </div>
  );
}
