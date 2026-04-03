import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createCase } from "@/lib/firestore";
import {
  newCaseSchema,
  type NewCaseFormData,
  type NewCaseFormInput,
} from "@/lib/schemas";
import { useState } from "react";

export default function NewCasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NewCaseFormInput, unknown, NewCaseFormData>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      patient: { gender: "male" },
      admission: { visitType: "ipd" },
    },
  });

  const visitType = watch("admission.visitType");

  const onSubmit = async (data: NewCaseFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const caseId = await createCase(user.uid, {
        patient: data.patient,
        admission: data.admission,
        tags,
      });

      toast({
        title: "Case created",
        description: `Patient ${data.patient.name} has been admitted.`,
      });

      navigate(`/cases/${caseId}`);
    } catch (_err) {
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">New Patient Case</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name *</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  {...register("patient.name")}
                />
                {errors.patient?.name && (
                  <p className="text-sm text-[hsl(var(--destructive))]">
                    {errors.patient.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Age"
                  {...register("patient.age")}
                />
                {errors.patient?.age && (
                  <p className="text-sm text-[hsl(var(--destructive))]">
                    {errors.patient.age.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={watch("patient.gender")}
                  onValueChange={(v) =>
                    setValue("patient.gender", v as "male" | "female" | "other")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select
                  value={watch("patient.bloodGroup") ?? ""}
                  onValueChange={(v) =>
                    setValue(
                      "patient.bloodGroup",
                      v as NewCaseFormData["patient"]["bloodGroup"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Patient phone number"
                {...register("patient.phone")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admission Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visit Type */}
            <div className="space-y-2">
              <Label>Visit Type *</Label>
              <Select
                value={watch("admission.visitType")}
                onValueChange={(v) =>
                  setValue("admission.visitType", v as "ipd" | "opd")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ipd">IPD (In-Patient)</SelectItem>
                  <SelectItem value="opd">OPD (Out-Patient)</SelectItem>
                </SelectContent>
              </Select>
              {errors.admission?.visitType && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {errors.admission.visitType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <Textarea
                id="chiefComplaint"
                placeholder="Primary reason for admission"
                {...register("admission.chiefComplaint")}
              />
              {errors.admission?.chiefComplaint && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {errors.admission.chiefComplaint.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialDiagnosis">Initial Diagnosis *</Label>
              <Input
                id="initialDiagnosis"
                placeholder="Working diagnosis"
                {...register("admission.initialDiagnosis")}
              />
              {errors.admission?.initialDiagnosis && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {errors.admission.initialDiagnosis.message}
                </p>
              )}
            </div>

            {/* Ward/Room only for IPD */}
            {visitType === "ipd" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    placeholder="e.g., ICU, Ward A"
                    {...register("admission.ward")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    placeholder="e.g., 204"
                    {...register("admission.roomNumber")}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="referredBy">Referred By</Label>
              <Input
                id="referredBy"
                placeholder="Referring doctor (optional)"
                {...register("admission.referredBy")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tags">Condition Tags</Label>
              <Input
                id="tags"
                placeholder="e.g., diabetes, cardiac, trauma (comma separated)"
                {...register("tags")}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Separate tags with commas for easy searching later.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : null}
            Create Case
          </Button>
        </div>
      </form>
    </div>
  );
}
