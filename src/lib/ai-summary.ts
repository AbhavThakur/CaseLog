import type { PatientCase, TimelineEntry } from "./types";
import type { Timestamp } from "firebase/firestore";

const GEMINI_MODEL = "gemini-2.0-flash";

function buildPrompt(
  patientCase: PatientCase,
  timeline: TimelineEntry[],
): string {
  const lines: string[] = [
    "You are a medical documentation assistant. Generate a concise discharge summary based on the patient case data below.",
    "Return ONLY a JSON object with these exact fields (no markdown, no code fences):",
    '{ "finalDiagnosis": "...", "treatmentSummary": "...", "followUpInstructions": "...", "medications": "comma, separated, list" }',
    "",
    "--- PATIENT DATA ---",
    `Name: ${patientCase.patient.name}`,
    `Age: ${patientCase.patient.age}, Gender: ${patientCase.patient.gender}`,
    `Chief Complaint: ${patientCase.admission.chiefComplaint}`,
    `Initial Diagnosis: ${patientCase.admission.initialDiagnosis}`,
  ];

  if (patientCase.patient.clinicalHistory) {
    lines.push(`Clinical History: ${patientCase.patient.clinicalHistory}`);
  }
  if (patientCase.patient.smokingStatus) {
    lines.push(`Smoking: ${patientCase.patient.smokingStatus}`);
  }

  if (patientCase.investigations) {
    const inv = patientCase.investigations;
    if (inv.chestXrayFindings)
      lines.push(`Chest X-ray: ${inv.chestXrayFindings}`);
    if (inv.ctFindings) lines.push(`CT: ${inv.ctFindings}`);
    if (inv.interventionDone)
      lines.push(`Intervention: ${inv.interventionDone}`);
    if (inv.procedureFindings)
      lines.push(`Procedure Findings: ${inv.procedureFindings}`);
    if (inv.balReport) lines.push(`BAL: ${inv.balReport}`);
    if (inv.histopathReport) lines.push(`Histopath: ${inv.histopathReport}`);
  }

  if (timeline.length > 0) {
    lines.push("", "--- TIMELINE ENTRIES ---");
    // Include last 20 entries to stay within token limits
    const recent = timeline.slice(-20);
    for (const entry of recent) {
      const date = entry.entryDate
        ? (entry.entryDate as Timestamp).toDate().toLocaleDateString()
        : "";
      const vitalsStr = entry.vitals
        ? ` | Vitals: ${[
            entry.vitals.bloodPressure && `BP:${entry.vitals.bloodPressure}`,
            entry.vitals.pulse && `HR:${entry.vitals.pulse}`,
            entry.vitals.temperature && `T:${entry.vitals.temperature}`,
            entry.vitals.spO2 && `SpO2:${entry.vitals.spO2}%`,
          ]
            .filter(Boolean)
            .join(", ")}`
        : "";
      lines.push(
        `[${date}] ${entry.type}: ${entry.title} — ${entry.description}${vitalsStr}`,
      );
    }
  }

  return lines.join("\n");
}

export interface AISummaryResult {
  finalDiagnosis: string;
  treatmentSummary: string;
  followUpInstructions: string;
  medications: string;
}

export async function generateDischargeSummary(
  apiKey: string,
  patientCase: PatientCase,
  timeline: TimelineEntry[],
): Promise<AISummaryResult> {
  const prompt = buildPrompt(patientCase, timeline);

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    },
  );

  if (!resp.ok) {
    const errorBody = await resp.text();
    throw new Error(`Gemini API error (${resp.status}): ${errorBody}`);
  }

  const data = await resp.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown fences if model adds them despite instructions
  const cleaned = text
    .replace(/^```json?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as AISummaryResult;
    return {
      finalDiagnosis: parsed.finalDiagnosis || "",
      treatmentSummary: parsed.treatmentSummary || "",
      followUpInstructions: parsed.followUpInstructions || "",
      medications: parsed.medications || "",
    };
  } catch {
    throw new Error(
      "Failed to parse AI response. The model returned an unexpected format.",
    );
  }
}
