import { createCase, addTimelineEntry, getDashboardStats } from "./firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, col } from "./firebase";

const SAMPLE_CASES = [
  {
    patient: {
      name: "Rajesh Kumar",
      age: 45,
      gender: "male" as const,
      bloodGroup: "B+" as const,
      phone: "9876543210",
      smokingStatus: "current" as const,
      clinicalHistory:
        "Known hypertensive on Amlodipine 5mg. Family Hx of CAD. No DM.",
    },
    admission: {
      chiefComplaint: "Chest pain and shortness of breath for 2 days",
      initialDiagnosis: "Acute Coronary Syndrome",
      visitType: "ipd" as const,
      ward: "Cardiology ICU",
      roomNumber: "ICU-04",
    },
    investigations: {
      chestXrayFindings: "Bilateral hilar prominence, cardiomegaly",
      ctFindings: "CTPA negative for PE. Mild pericardial effusion noted.",
      interventionDone: "Coronary angiography via right radial approach",
      procedureFindings:
        "90% stenosis in LAD mid-segment. Stented with DES 3.0x28mm.",
    },
    tags: ["cardiac", "urgent"],
  },
  {
    patient: {
      name: "Priya Sharma",
      age: 32,
      gender: "female" as const,
      bloodGroup: "O+" as const,
      smokingStatus: "never" as const,
      clinicalHistory: "No known comorbidities. G2P1L1. Last LMP 2 weeks ago.",
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
      smokingStatus: "former" as const,
      clinicalHistory:
        "Ex-smoker (20 pack-years, quit 5 yrs ago). COPD on inhalers. Type 2 DM on Metformin.",
    },
    admission: {
      chiefComplaint: "Progressive difficulty walking, numbness in legs",
      initialDiagnosis: "Lumbar Canal Stenosis",
      visitType: "opd" as const,
    },
    investigations: {
      ctFindings:
        "HRCT chest: centrilobular emphysema upper lobes, mild bronchial wall thickening",
      balReport:
        "BAL fluid: 60% macrophages, 20% lymphocytes. No malignant cells. AFB negative.",
      histopathReport:
        "Transbronchial biopsy: chronic inflammation with fibrosis. No granulomas.",
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
  // Use a Firestore flag to prevent duplicate seeding (race-safe)
  const seedRef = doc(db, col("doctors"), doctorId, "meta", "demo_seed");
  const seedSnap = await getDoc(seedRef);
  if (seedSnap.exists()) return; // Already seeded

  // Mark as seeded immediately to block concurrent tabs
  await setDoc(seedRef, { seededAt: new Date().toISOString() });

  // Double-check: if cases already exist, skip
  const stats = await getDashboardStats(doctorId);
  if (stats.totalCases > 0) return;

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
