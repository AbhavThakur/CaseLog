import { jsPDF } from "jspdf";
import type { PatientCase, TimelineEntry } from "./types";
import { formatDate, formatDateTime } from "./utils";
import type { Timestamp } from "firebase/firestore";

const PAGE_MARGIN = 20;
const LINE_HEIGHT = 7;
const CONTENT_WIDTH = 170; // A4 width (210) minus 2 margins

function addHeader(doc: jsPDF, patientCase: PatientCase) {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Case Summary", PAGE_MARGIN, 25);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${patientCase.caseNumber}`, PAGE_MARGIN, 32);
  doc.text(`Generated ${formatDateTime(new Date())}`, 210 - PAGE_MARGIN, 32, {
    align: "right",
  });
  doc.setTextColor(0);

  // Divider line
  doc.setDrawColor(200);
  doc.line(PAGE_MARGIN, 36, 210 - PAGE_MARGIN, 36);
}

function addSection(doc: jsPDF, title: string, y: number): number {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 80, 160);
  doc.text(title, PAGE_MARGIN, y);
  doc.setTextColor(0);
  return y + LINE_HEIGHT + 2;
}

function addField(doc: jsPDF, label: string, value: string, y: number): number {
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, PAGE_MARGIN + 2, y);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(value || "—", CONTENT_WIDTH - 40);
  doc.text(lines, PAGE_MARGIN + 42, y);
  return y + Math.max(lines.length, 1) * (LINE_HEIGHT - 1.5) + 2;
}

export function exportCasePDF(
  patientCase: PatientCase,
  timeline: TimelineEntry[],
  doctorName?: string,
): void {
  const doc = new jsPDF();

  // Header
  addHeader(doc, patientCase);
  let y = 44;

  // Patient Demographics
  y = addSection(doc, "Patient Demographics", y);
  y = addField(doc, "Name", patientCase.patient.name, y);
  y = addField(
    doc,
    "Age / Gender",
    `${patientCase.patient.age} yrs, ${patientCase.patient.gender}`,
    y,
  );
  if (patientCase.patient.bloodGroup) {
    y = addField(doc, "Blood Group", patientCase.patient.bloodGroup, y);
  }
  if (patientCase.patient.phone) {
    y = addField(doc, "Phone", patientCase.patient.phone, y);
  }
  if (patientCase.patient.smokingStatus) {
    y = addField(doc, "Smoking Status", patientCase.patient.smokingStatus, y);
  }
  if (patientCase.patient.clinicalHistory) {
    y = addField(
      doc,
      "Clinical History",
      patientCase.patient.clinicalHistory,
      y,
    );
  }
  y += 4;

  // Admission Details
  y = addSection(doc, "Admission Details", y);
  const admDate = patientCase.admission.date
    ? formatDate((patientCase.admission.date as Timestamp).toDate())
    : "N/A";
  y = addField(doc, "Date", admDate, y);
  y = addField(
    doc,
    "Visit Type",
    (patientCase.admission.visitType ?? "ipd").toUpperCase(),
    y,
  );
  y = addField(doc, "Chief Complaint", patientCase.admission.chiefComplaint, y);
  y = addField(doc, "Diagnosis", patientCase.admission.initialDiagnosis, y);
  if (patientCase.admission.ward) {
    y = addField(
      doc,
      "Ward / Room",
      `${patientCase.admission.ward}${patientCase.admission.roomNumber ? `, Room ${patientCase.admission.roomNumber}` : ""}`,
      y,
    );
  }
  if (patientCase.admission.referredBy) {
    y = addField(doc, "Referred By", patientCase.admission.referredBy, y);
  }
  if (patientCase.tags.length > 0) {
    y = addField(doc, "Tags", patientCase.tags.join(", "), y);
  }
  y += 4;

  // Investigations & Reports
  if (patientCase.investigations) {
    const inv = patientCase.investigations;
    const hasAny =
      inv.chestXrayFindings ||
      inv.ctFindings ||
      inv.interventionDone ||
      inv.procedureFindings ||
      inv.balReport ||
      inv.histopathReport;
    if (hasAny) {
      y = addSection(doc, "Investigations & Reports", y);
      if (inv.chestXrayFindings)
        y = addField(doc, "Chest X-ray", inv.chestXrayFindings, y);
      if (inv.ctFindings) y = addField(doc, "CT Findings", inv.ctFindings, y);
      if (inv.interventionDone)
        y = addField(doc, "Intervention", inv.interventionDone, y);
      if (inv.procedureFindings)
        y = addField(doc, "Procedure Findings", inv.procedureFindings, y);
      if (inv.balReport) y = addField(doc, "BAL Report", inv.balReport, y);
      if (inv.histopathReport)
        y = addField(doc, "Histopath Report", inv.histopathReport, y);
      y += 4;
    }
  }

  // Follow-Up Visits
  if (patientCase.followUps && patientCase.followUps.length > 0) {
    y = addSection(doc, "Follow-Up Visits", y);
    for (const fu of patientCase.followUps) {
      const fuDate = fu.date
        ? formatDate((fu.date as Timestamp).toDate())
        : "N/A";
      y = addField(doc, fuDate, fu.notes, y);
    }
    y += 4;
  }

  // Discharge Summary (if discharged)
  if (patientCase.discharge) {
    y = addSection(doc, "Discharge Summary", y);
    const discDate = patientCase.discharge.date
      ? formatDate((patientCase.discharge.date as Timestamp).toDate())
      : "N/A";
    y = addField(doc, "Discharge Date", discDate, y);
    y = addField(doc, "Outcome", patientCase.discharge.outcome, y);
    y = addField(
      doc,
      "Final Diagnosis",
      patientCase.discharge.finalDiagnosis,
      y,
    );
    y = addField(
      doc,
      "Treatment Summary",
      patientCase.discharge.treatmentSummary,
      y,
    );
    if (patientCase.discharge.followUpInstructions) {
      y = addField(
        doc,
        "Follow-Up",
        patientCase.discharge.followUpInstructions,
        y,
      );
    }
    if (
      patientCase.discharge.medications &&
      patientCase.discharge.medications.length > 0
    ) {
      y = addField(
        doc,
        "Medications",
        patientCase.discharge.medications.join(", "),
        y,
      );
    }
    y += 4;
  }

  // Timeline entries
  if (timeline.length > 0) {
    y = addSection(doc, `Timeline (${timeline.length} entries)`, y);

    for (const entry of timeline) {
      if (y > 255) {
        doc.addPage();
        y = 20;
      }

      const entryDate = entry.entryDate
        ? formatDateTime((entry.entryDate as Timestamp).toDate())
        : "";

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${entry.type.replace("-", " ").toUpperCase()} — ${entry.title}`,
        PAGE_MARGIN + 2,
        y,
      );
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(entryDate, 210 - PAGE_MARGIN, y, { align: "right" });
      doc.setTextColor(0);
      y += LINE_HEIGHT - 1;

      if (entry.description) {
        const descLines = doc.splitTextToSize(
          entry.description,
          CONTENT_WIDTH - 4,
        );
        doc.setFontSize(8);
        doc.text(descLines, PAGE_MARGIN + 4, y);
        y += descLines.length * (LINE_HEIGHT - 2) + 1;
      }

      if (entry.vitals) {
        const vitalsText = [
          entry.vitals.bloodPressure && `BP: ${entry.vitals.bloodPressure}`,
          entry.vitals.pulse && `HR: ${entry.vitals.pulse} bpm`,
          entry.vitals.temperature && `Temp: ${entry.vitals.temperature}°`,
          entry.vitals.spO2 && `SpO2: ${entry.vitals.spO2}%`,
        ]
          .filter(Boolean)
          .join("  |  ");
        if (vitalsText) {
          doc.setFontSize(8);
          doc.setTextColor(80);
          doc.text(`Vitals: ${vitalsText}`, PAGE_MARGIN + 4, y);
          doc.setTextColor(0);
          y += LINE_HEIGHT - 1;
        }
      }

      y += 3;
    }
  }

  // Footer
  if (doctorName) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    y += 6;
    doc.setDrawColor(200);
    doc.line(PAGE_MARGIN, y, 210 - PAGE_MARGIN, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    doc.text(`Prepared by: ${doctorName}`, PAGE_MARGIN, y);
    doc.setTextColor(0);
  }

  // Save
  const safeName = patientCase.patient.name
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
  doc.save(`case-${patientCase.caseNumber}-${safeName}.pdf`);
}
