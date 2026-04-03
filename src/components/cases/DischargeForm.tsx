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

interface Props {
  open: boolean;
  onClose: () => void;
  caseId: string;
}

export function DischargeForm({ open, onClose, caseId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
        </DialogHeader>

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
