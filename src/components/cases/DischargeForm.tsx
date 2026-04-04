import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { dischargeCase } from "@/lib/firestore";
import { dischargeSchema, type DischargeFormData } from "@/lib/schemas";
import { generateDischargeSummary } from "@/lib/ai-summary";
import type { PatientCase, TimelineEntry } from "@/lib/types";
import { Sparkles } from "lucide-react";

const AI_KEY_STORAGE = "caselog_gemini_key";

interface Props {
  open: boolean;
  onClose: () => void;
  caseId: string;
  patientCase?: PatientCase;
  timeline?: TimelineEntry[];
}

export function DischargeForm({
  open,
  onClose,
  caseId,
  patientCase,
  timeline,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(AI_KEY_STORAGE) ?? "",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DischargeFormData>({
    resolver: zodResolver(dischargeSchema),
  });

  const onSubmit = async (data: DischargeFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const medications = data.medications
        ? data.medications
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean)
        : undefined;

      await dischargeCase(user.uid, caseId, {
        finalDiagnosis: data.finalDiagnosis,
        treatmentSummary: data.treatmentSummary,
        outcome: data.outcome,
        followUpInstructions: data.followUpInstructions,
        medications,
      });

      toast({
        title: "Patient discharged",
        description: "Case has been closed successfully.",
      });
      onClose();
    } catch (_err) {
      toast({
        title: "Error",
        description: "Failed to discharge patient.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!apiKey.trim()) {
      setShowApiKey(true);
      return;
    }
    if (!patientCase || !timeline) {
      toast({
        title: "Missing data",
        description: "Case data is not available for AI generation.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Persist key for future use
      localStorage.setItem(AI_KEY_STORAGE, apiKey.trim());
      const result = await generateDischargeSummary(
        apiKey.trim(),
        patientCase,
        timeline,
      );
      setValue("finalDiagnosis", result.finalDiagnosis);
      setValue("treatmentSummary", result.treatmentSummary);
      setValue("followUpInstructions", result.followUpInstructions);
      setValue("medications", result.medications);
      toast({
        title: "AI summary generated",
        description: "Review and edit the fields before confirming.",
      });
    } catch (err) {
      toast({
        title: "AI generation failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
        </DialogHeader>

        {/* AI Generate Button */}
        {patientCase && timeline && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleGenerateAI}
              disabled={generating}
            >
              {generating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[hsl(var(--primary))] mr-2" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              )}
              {generating ? "Generating…" : "Auto-fill with AI"}
            </Button>
            {showApiKey && (
              <div className="space-y-1.5 p-3 rounded-lg bg-[hsl(var(--muted))]/50 border">
                <Label htmlFor="geminiKey" className="text-xs">
                  Gemini API Key (free at{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--primary))] underline"
                  >
                    aistudio.google.com
                  </a>
                  )
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="geminiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateAI}
                    disabled={!apiKey.trim() || generating}
                  >
                    Go
                  </Button>
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  Key is stored locally in your browser only. Never sent to our
                  servers.
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finalDiagnosis">Final Diagnosis *</Label>
            <Input
              id="finalDiagnosis"
              placeholder="Confirmed diagnosis"
              {...register("finalDiagnosis")}
            />
            {errors.finalDiagnosis && (
              <p className="text-sm text-[hsl(var(--destructive))]">
                {errors.finalDiagnosis.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Outcome *</Label>
            <Select
              value={watch("outcome") ?? ""}
              onValueChange={(v) =>
                setValue("outcome", v as DischargeFormData["outcome"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recovered">Recovered</SelectItem>
                <SelectItem value="improved">Improved</SelectItem>
                <SelectItem value="LAMA">
                  LAMA (Left Against Medical Advice)
                </SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            {errors.outcome && (
              <p className="text-sm text-[hsl(var(--destructive))]">
                {errors.outcome.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentSummary">Treatment Summary *</Label>
            <Textarea
              id="treatmentSummary"
              placeholder="Summary of treatments administered..."
              rows={3}
              {...register("treatmentSummary")}
            />
            {errors.treatmentSummary && (
              <p className="text-sm text-[hsl(var(--destructive))]">
                {errors.treatmentSummary.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
            <Textarea
              id="followUpInstructions"
              placeholder="Post-discharge care instructions..."
              rows={2}
              {...register("followUpInstructions")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Discharge Medications</Label>
            <Input
              id="medications"
              placeholder="e.g., Aspirin 75mg, Atorvastatin 40mg (comma separated)"
              {...register("medications")}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} variant="destructive">
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              Confirm Discharge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
