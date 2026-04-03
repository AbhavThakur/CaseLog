import { createCase, addTimelineEntry, getDashboardStats } from "./firestore";

const SAMPLE_CASES = [
  {
    patient: {
      name: "Rajesh Kumar",
      age: 45,
      gender: "male" as const,
      bloodGroup: "B+" as const,
      phone: "9876543210",
    },
    admission: {
      chiefComplaint: "Chest pain and shortness of breath for 2 days",
      initialDiagnosis: "Acute Coronary Syndrome",
      visitType: "ipd" as const,
      ward: "Cardiology ICU",
      roomNumber: "ICU-04",
    },
    tags: ["cardiac", "urgent"],
  },
  {
    patient: {
      name: "Priya Sharma",
      age: 32,
      gender: "female" as const,
      bloodGroup: "O+" as const,
    },
    admission: {
      chiefComplaint: "High-grade fever with joint pain for 5 days",
      initialDiagnosis: "Dengue Fever",
      visitType: "ipd" as const,
      referredBy: "Dr. Mehta (GP)",
      ward: "General Medicine",
      roomNumber: "203-A",
    },
    tags: ["infectious", "dengue"],
  },
  {
    patient: {
      name: "Amit Patel",
      age: 58,
      gender: "male" as const,
      bloodGroup: "A+" as const,
    },
    admission: {
      chiefComplaint: "Progressive difficulty walking, numbness in legs",
      initialDiagnosis: "Lumbar Canal Stenosis",
      visitType: "opd" as const,
    },
    tags: ["ortho", "elective"],
  },
];

const SAMPLE_ENTRIES = [
  {
    type: "observation" as const,
    title: "Initial Assessment",
    description:
      "Patient conscious, oriented. BP 150/90, pulse 98 bpm. ECG shows ST elevation in leads V1-V4.",
    priority: "critical" as const,
    vitals: { bloodPressure: "150/90", pulse: 98, spO2: 94 },
    attachments: [],
  },
  {
    type: "medication" as const,
    title: "Started dual antiplatelet therapy",
    description:
      "Tab. Aspirin 325mg + Tab. Clopidogrel 300mg loading dose given.",
    priority: "important" as const,
    attachments: [],
  },
  {
    type: "lab-result" as const,
    title: "Troponin I elevated",
    description:
      "Troponin I: 2.8 ng/mL (Normal < 0.04). CBC — WBC 11,200. CRP elevated.",
    priority: "important" as const,
    attachments: [],
  },
];

export async function seedDemoData(doctorId: string): Promise<void> {
  // Check if demo data already exists
  const stats = await getDashboardStats(doctorId);
  if (stats.totalCases > 0) return; // Already seeded

  // Create sample cases
  for (let i = 0; i < SAMPLE_CASES.length; i++) {
    const caseData = SAMPLE_CASES[i]!;
    const caseId = await createCase(doctorId, caseData);

    // Add timeline entries for the first case only (to keep it focused)
    if (i === 0) {
      for (const entry of SAMPLE_ENTRIES) {
        await addTimelineEntry(doctorId, caseId, entry);
      }
    }
  }
}
