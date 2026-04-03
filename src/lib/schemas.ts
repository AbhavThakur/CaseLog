import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Patient name is required"),
  age: z.coerce.number().min(0, "Invalid age").max(150, "Invalid age"),
  gender: z.enum(["male", "female", "other"], {
    message: "Select gender",
  }),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  phone: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relation: z.string(),
    })
    .optional(),
});

export const admissionSchema = z.object({
  chiefComplaint: z.string().min(3, "Describe the chief complaint"),
  initialDiagnosis: z.string().min(2, "Initial diagnosis required"),
  visitType: z.enum(["ipd", "opd"], {
    message: "Select visit type",
  }),
  referredBy: z.string().optional(),
  ward: z.string().optional(),
  roomNumber: z.string().optional(),
});

export const newCaseSchema = z.object({
  patient: patientSchema,
  admission: admissionSchema,
  tags: z.string().optional(),
});

export const timelineEntrySchema = z.object({
  type: z.enum([
    "observation",
    "treatment",
    "medication",
    "procedure",
    "lab-result",
    "imaging",
    "note",
    "complication",
  ]),
  title: z.string().min(2, "Title required"),
  description: z.string().default(""),
  priority: z.enum(["normal", "important", "critical"]).default("normal"),
  vitals: z
    .object({
      bloodPressure: z.string().optional(),
      pulse: z.coerce.number().optional(),
      temperature: z.coerce.number().optional(),
      spO2: z.coerce.number().min(0).max(100).optional(),
      respiratoryRate: z.coerce.number().optional(),
      weight: z.coerce.number().optional(),
    })
    .optional(),
});

export const dischargeSchema = z.object({
  finalDiagnosis: z.string().min(2, "Final diagnosis required"),
  treatmentSummary: z.string().min(5, "Treatment summary required"),
  outcome: z.enum(["recovered", "improved", "LAMA", "referred", "expired"], {
    message: "Select outcome",
  }),
  followUpInstructions: z.string().optional(),
  medications: z.string().optional(),
});

export const profileSchema = z.object({
  displayName: z.string().min(2, "Name is required"),
  specialization: z.string().min(2, "Specialization is required"),
  hospital: z.string().min(2, "Hospital/clinic is required"),
  practiceType: z.enum(["hospital", "clinic", "both"], {
    message: "Select practice type",
  }),
  phone: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type AdmissionFormData = z.infer<typeof admissionSchema>;
export type NewCaseFormData = z.infer<typeof newCaseSchema>;
export type TimelineEntryFormData = z.infer<typeof timelineEntrySchema>;
export type DischargeFormData = z.infer<typeof dischargeSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

// Input types for react-hook-form (before Zod transforms/defaults)
export type NewCaseFormInput = z.input<typeof newCaseSchema>;
export type TimelineEntryFormInput = z.input<typeof timelineEntrySchema>;
