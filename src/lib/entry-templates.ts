export interface EntryTemplate {
  id: string;
  label: string;
  category: string;
  type:
    | "observation"
    | "treatment"
    | "medication"
    | "procedure"
    | "lab-result"
    | "imaging"
    | "note"
    | "complication";
  title: string;
  description: string;
  priority: "normal" | "important" | "critical";
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    spO2?: number;
    respiratoryRate?: number;
    weight?: number;
  };
}

export const entryTemplates: EntryTemplate[] = [
  // ── Admission ──
  {
    id: "admission-workup",
    label: "Admission Workup",
    category: "Admission",
    type: "observation",
    title: "Admission Assessment",
    description:
      "Chief Complaint:\nHistory of Present Illness:\nPast Medical History:\nAllergies:\nCurrent Medications:\nPhysical Examination:\n- General:\n- CVS:\n- RS:\n- P/A:\n- CNS:\nProvisional Diagnosis:\nPlan:",
    priority: "important",
  },
  {
    id: "admission-orders",
    label: "Admission Orders",
    category: "Admission",
    type: "treatment",
    title: "Admission Orders",
    description:
      "Admit to:\nDiet:\nActivity:\nIV Fluids:\nMedications:\n1.\n2.\n3.\nInvestigations:\n- CBC, RFT, LFT, Electrolytes\n- ECG\n- Chest X-ray\nMonitoring:\n- Vitals q4h\n- I/O charting\nSpecial Instructions:",
    priority: "important",
  },

  // ── Daily Rounds ──
  {
    id: "morning-round",
    label: "Morning Round Note",
    category: "Rounds",
    type: "observation",
    title: "Morning Round",
    description:
      "Subjective: Patient reports...\nOvernight events:\nObjective:\n- Vitals: see vitals tab\n- I/O:\n- Examination findings:\nAssessment:\nPlan:\n- Continue current medications\n- Modify:\n- Add:",
    priority: "normal",
  },
  {
    id: "post-op-day1",
    label: "Post-Op Day 1",
    category: "Rounds",
    type: "observation",
    title: "Post-Operative Day 1",
    description:
      "Procedure performed:\nAnesthesia type:\nSubjective: Pain level /10, nausea, ambulation status\nObjective:\n- Wound/drain status:\n- Vitals: see vitals tab\n- Urine output:\nAssessment: Stable post-operative course\nPlan:\n- Pain management:\n- DVT prophylaxis:\n- Diet advancement:\n- Mobilization plan:",
    priority: "normal",
  },

  // ── Procedures ──
  {
    id: "procedure-note",
    label: "Procedure Note",
    category: "Procedures",
    type: "procedure",
    title: "Procedure Note",
    description:
      "Procedure:\nIndication:\nConsent: Obtained / Written\nAnesthesia:\nTechnique:\n\nFindings:\n\nSpecimens sent:\nComplications: None\nEBL:\nPost-procedure instructions:",
    priority: "normal",
  },
  {
    id: "lumbar-puncture",
    label: "Lumbar Puncture",
    category: "Procedures",
    type: "procedure",
    title: "Lumbar Puncture",
    description:
      "Indication:\nPosition: Left lateral decubitus / Sitting\nSite: L3-L4 / L4-L5\nAnesthesia: Local (Lidocaine 2%)\nOpening pressure: ___ cmH2O\nCSF appearance: Clear / Turbid / Xanthochromic\nTubes sent:\n- Tube 1: Cell count\n- Tube 2: Biochemistry (protein, glucose)\n- Tube 3: Culture & sensitivity\n- Tube 4: Special tests\nClosing pressure:\nComplications: None\nPost-LP care: Bed rest 4-6 hours, hydration",
    priority: "normal",
  },

  // ── Medications ──
  {
    id: "antibiotic-escalation",
    label: "Antibiotic Escalation",
    category: "Medications",
    type: "medication",
    title: "Antibiotic Change",
    description:
      "Current antibiotic:\nDay of current antibiotic:\nReason for change:\n- Persistent fever / Rising counts / Culture sensitivity\nCulture report:\n- Organism:\n- Sensitivity:\nNew antibiotic:\n- Drug:\n- Dose:\n- Route:\n- Duration planned:",
    priority: "important",
  },
  {
    id: "insulin-regimen",
    label: "Insulin Regimen",
    category: "Medications",
    type: "medication",
    title: "Insulin Regimen Adjustment",
    description:
      "Current blood sugar: mg/dL (fasting / random / post-prandial)\nHbA1c:\nCurrent insulin regimen:\n- Basal:\n- Bolus:\nAdjustment:\n- New basal dose:\n- New bolus dose:\n- Sliding scale: Yes / No\nMonitoring: QID CBG before meals and at bedtime\nHypoglycemia protocol: If CBG < 70 → give ___",
    priority: "normal",
  },

  // ── Lab Results ──
  {
    id: "lab-cbc",
    label: "CBC Report",
    category: "Labs",
    type: "lab-result",
    title: "CBC Report",
    description:
      "Hb: g/dL\nWBC: /μL\n- Neutrophils: %\n- Lymphocytes: %\nPlatelet: /μL\nHCT:\nMCV:\nRDW:\n\nInterpretation:\nAction:",
    priority: "normal",
  },
  {
    id: "lab-rft",
    label: "Renal Function Test",
    category: "Labs",
    type: "lab-result",
    title: "Renal Function Test",
    description:
      "Urea: mg/dL\nCreatinine: mg/dL\neGFR: mL/min\nNa+: mEq/L\nK+: mEq/L\nCl-: mEq/L\nHCO3-: mEq/L\nCa++: mg/dL\nPhosphate: mg/dL\nUric acid: mg/dL\n\nInterpretation:\nAction:",
    priority: "normal",
  },
  {
    id: "lab-lft",
    label: "Liver Function Test",
    category: "Labs",
    type: "lab-result",
    title: "Liver Function Test",
    description:
      "Total Bilirubin: mg/dL\nDirect Bilirubin: mg/dL\nAST (SGOT): U/L\nALT (SGPT): U/L\nALP: U/L\nGGT: U/L\nTotal Protein: g/dL\nAlbumin: g/dL\nGlobulin: g/dL\nA/G Ratio:\n\nInterpretation:\nAction:",
    priority: "normal",
  },

  // ── Imaging ──
  {
    id: "xray-report",
    label: "X-Ray Report",
    category: "Imaging",
    type: "imaging",
    title: "X-Ray Report",
    description:
      "Type: Chest PA / AP / Lateral / Abdomen / Extremity\nIndication:\nFindings:\n- Lung fields:\n- Heart shadow:\n- Mediastinum:\n- Bony thorax:\n- Diaphragm:\n- Soft tissues:\nImpression:\nComparison with previous (if any):",
    priority: "normal",
  },

  // ── Complications ──
  {
    id: "deterioration",
    label: "Clinical Deterioration",
    category: "Complications",
    type: "complication",
    title: "Clinical Deterioration",
    description:
      "Time of deterioration:\nPrevious status:\nCurrent status:\nVitals at time of event:\n- BP:\n- HR:\n- SpO2:\n- RR:\n- Temp:\nAssessment:\nImmediate actions taken:\n1.\n2.\n3.\nSenior informed: Yes - Dr. ___\nEscalation plan:",
    priority: "critical",
  },

  // ── Discharge ──
  {
    id: "discharge-summary",
    label: "Discharge Note",
    category: "Discharge",
    type: "note",
    title: "Discharge Summary Note",
    description:
      "Date of Admission:\nDate of Discharge:\nFinal Diagnosis:\nCourse in Hospital:\n\nProcedures Performed:\n\nDischarge Medications:\n1.\n2.\n3.\nFollow-up:\n- Date:\n- With: Dr.\nDiet / Activity Advice:\nWarning Signs to Watch:",
    priority: "normal",
  },
];

export const templateCategories = [
  ...new Set(entryTemplates.map((t) => t.category)),
];
