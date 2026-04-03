/**
 * Seed script: Populates the demo account with rich, detailed patient cases.
 *
 * Usage:  node scripts/seed-demo.mjs
 *
 * Connects to the LIVE Firebase project (dev prefix) and writes under the
 * demo user's UID so the data shows up when someone clicks "Try Demo".
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  Timestamp,
  writeBatch,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore";

// ── Firebase config (same as in .env.local) ──
const firebaseConfig = {
  apiKey: "AIzaSyBKnLZ8tYqHAt1VG450zAOQt4EsvIgb5qk",
  authDomain: "caselog-61c8b.firebaseapp.com",
  projectId: "caselog-61c8b",
  storageBucket: "caselog-61c8b.firebasestorage.app",
  messagingSenderId: "63625945106",
  appId: "1:63625945106:web:2c1d4c8a640cb00a20b8cb",
};

const ENV_PREFIX = "dev_"; // seed into dev collections

function col(name) {
  return `${ENV_PREFIX}${name}`;
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── Authenticate as demo ──
const DEMO_EMAIL = "demo@caselog.app";
const DEMO_PASSWORD = "demo123456";

console.log("🔐 Signing in as demo user…");
const cred = await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
const uid = cred.user.uid;
console.log(`✅ Signed in — UID: ${uid}`);

// ── Helper: write a doctor profile ──
await setDoc(
  doc(db, col("doctors"), uid),
  {
    uid,
    email: DEMO_EMAIL,
    displayName: "Dr. Demo Sharma",
    specialization: "General Medicine & Cardiology",
    hospital: "CaseLog Demo Hospital",
    practiceType: "hospital",
    isAdmin: false,
    storageUsedBytes: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  { merge: true },
);

console.log("👤 Doctor profile ensured");

// ── Helpers ────────────────────────────────────────────────────────

function daysAgo(n) {
  return Timestamp.fromDate(new Date(Date.now() - n * 86400000));
}
function hoursAgo(n) {
  return Timestamp.fromDate(new Date(Date.now() - n * 3600000));
}

let caseSeq = 0;
function nextCaseNumber() {
  caseSeq++;
  return `CL-2026-${String(caseSeq).padStart(4, "0")}`;
}

async function createCase(data) {
  const caseNumber = nextCaseNumber();
  const ref = doc(collection(db, col("doctors"), uid, "cases"));
  const caseId = ref.id;

  await setDoc(ref, {
    ...data,
    caseNumber,
    ownerId: uid,
    fileCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return caseId;
}

async function addTimeline(caseId, entry) {
  await addDoc(
    collection(db, col("doctors"), uid, "cases", caseId, "timeline"),
    {
      ...entry,
      attachments: entry.attachments ?? [],
      entryDate: entry.entryDate ?? Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );
}

async function addVitals(caseId, vitals) {
  await addDoc(collection(db, col("doctors"), uid, "cases", caseId, "vitals"), {
    ...vitals,
    createdAt: Timestamp.now(),
  });
}

async function addReminder(reminder) {
  await addDoc(collection(db, col("doctors"), uid, "reminders"), {
    ...reminder,
    createdAt: Timestamp.now(),
  });
}

// ═══════════════════════════════════════════════════════════════════
// CASE 1: Acute Myocardial Infarction (Active — Critical — ICU)
// ═══════════════════════════════════════════════════════════════════
console.log("📋 Creating Case 1: Acute MI…");

const case1 = await createCase({
  patient: {
    name: "Rajesh Kumar",
    age: 58,
    gender: "male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    emergencyContact: {
      name: "Priya Kumar",
      phone: "+91 98765 43211",
      relation: "Wife",
    },
  },
  admission: {
    date: daysAgo(3),
    chiefComplaint:
      "Severe crushing chest pain radiating to left arm × 2 hours, diaphoresis, nausea",
    initialDiagnosis:
      "ST-Elevation Myocardial Infarction (STEMI) — Anterior Wall",
    visitType: "ipd",
    referredBy: "Self — brought by ambulance",
    ward: "Cardiac ICU",
    roomNumber: "CICU-204",
  },
  status: "active",
  tags: ["cardiac", "STEMI", "ICU", "critical", "thrombolysis"],
  isCaseStudy: true,
});

// Vitals progression — admission (critical)
await addVitals(case1, {
  recordedAt: daysAgo(3),
  bloodPressureSystolic: 88,
  bloodPressureDiastolic: 54,
  pulse: 118,
  temperature: 37.2,
  spO2: 89,
  respiratoryRate: 28,
  weight: 78,
  notes: "Admission vitals — hypotensive, tachycardic, SpO2 critically low",
});

await addVitals(case1, {
  recordedAt: daysAgo(2.5),
  bloodPressureSystolic: 96,
  bloodPressureDiastolic: 62,
  pulse: 108,
  temperature: 37.4,
  spO2: 91,
  respiratoryRate: 24,
  notes: "Post-thrombolysis — marginal improvement, still on O2",
});

await addVitals(case1, {
  recordedAt: daysAgo(2),
  bloodPressureSystolic: 108,
  bloodPressureDiastolic: 68,
  pulse: 96,
  temperature: 37.0,
  spO2: 94,
  respiratoryRate: 20,
  weight: 78,
  notes: "Day 2 — stabilizing, vasopressors being tapered",
});

await addVitals(case1, {
  recordedAt: daysAgo(1),
  bloodPressureSystolic: 116,
  bloodPressureDiastolic: 72,
  pulse: 84,
  temperature: 36.8,
  spO2: 96,
  respiratoryRate: 18,
  notes: "Day 3 — significant improvement, off vasopressors",
});

await addVitals(case1, {
  recordedAt: hoursAgo(4),
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 76,
  pulse: 78,
  temperature: 36.6,
  spO2: 97,
  respiratoryRate: 16,
  weight: 77.5,
  bloodSugar: 142,
  notes: "Latest — hemodynamically stable, pain-free",
});

// Timeline entries — detailed and varied
await addTimeline(case1, {
  type: "observation",
  title: "Emergency Admission — STEMI confirmed",
  description:
    "58M presented to ED via ambulance with 2h history of crushing retrosternal chest pain radiating to left arm, associated with diaphoresis and nausea. ECG shows ST elevation in leads V1-V4 (anterior wall). Troponin I: 4.8 ng/mL (markedly elevated). KILLIP Class II. Door-to-needle: 22 minutes.",
  priority: "critical",
  vitals: {
    bloodPressure: "88/54",
    pulse: 118,
    temperature: 37.2,
    spO2: 89,
    respiratoryRate: 28,
  },
  entryDate: daysAgo(3),
});

await addTimeline(case1, {
  type: "treatment",
  title: "Thrombolysis — Tenecteplase administered",
  description:
    "IV Tenecteplase 40mg (weight-based) administered at 14:22. DAPT loaded: Aspirin 325mg + Clopidogrel 600mg. Enoxaparin 60mg SC. Atorvastatin 80mg stat. Morphine 4mg IV for pain. Metoclopramide 10mg IV for nausea. O2 via NRB mask at 12L/min.",
  priority: "critical",
  entryDate: daysAgo(3),
});

await addTimeline(case1, {
  type: "lab-result",
  title: "Troponin & Cardiac Markers — Serial",
  description:
    "Troponin I:\n• 0h: 4.8 ng/mL ↑↑↑\n• 6h: 22.1 ng/mL (peak)\n• 12h: 18.4 ng/mL ↓\n• 24h: 11.2 ng/mL ↓\n\nCK-MB: 186 U/L → 312 U/L → 245 U/L\nBNP: 890 pg/mL\nCreatinine: 1.1 mg/dL\nHbA1c: 7.2% (new DM diagnosis)\nLipid: TC 248, LDL 168, HDL 34, TG 230",
  priority: "important",
  entryDate: daysAgo(2.5),
});

await addTimeline(case1, {
  type: "imaging",
  title: "Echocardiogram — Bedside",
  description:
    "TTE performed at bedside:\n• LVEF 38% (reduced)\n• Anterior wall hypokinesia\n• Apical akinesia noted\n• Mild MR (Grade I)\n• No pericardial effusion\n• RV function preserved\n• E/A ratio 1.4\n\nImpression: Regional wall motion abnormality consistent with LAD territory infarction. Mild LV systolic dysfunction.",
  priority: "important",
  entryDate: daysAgo(2),
});

await addTimeline(case1, {
  type: "medication",
  title: "Current Medication Chart",
  description:
    "• Aspirin 75mg OD\n• Clopidogrel 75mg OD (× 12 months)\n• Atorvastatin 40mg HS\n• Metoprolol 25mg BD\n• Ramipril 2.5mg OD (uptitrate)\n• Pantoprazole 40mg OD\n• Enoxaparin 40mg SC OD (till ambulation)\n• Metformin 500mg BD (new — for HbA1c 7.2)\n• GTN SL PRN",
  priority: "normal",
  entryDate: daysAgo(1.5),
});

await addTimeline(case1, {
  type: "procedure",
  title: "Coronary Angiography — Planned",
  description:
    "Patient stabilized for diagnostic coronary angiography + PCI if indicated. Consented for procedure. Scheduled for tomorrow 09:00. Expected — LAD culprit lesion, possible LCx disease. Discussed risks: bleeding, contrast nephropathy (<1%), stent thrombosis. Patient and family counseled.",
  priority: "important",
  entryDate: hoursAgo(6),
});

await addTimeline(case1, {
  type: "note",
  title: "Family Counseling — Prognosis Discussion",
  description:
    "Discussed with wife Mrs. Priya Kumar:\n• Current condition: stable but guarded\n• Need for angiography and possible stenting\n• New diabetes diagnosis — will need long-term management\n• Lifestyle modifications: smoking cessation, diet, exercise after recovery\n• Expected hospital stay: 5–7 days if uncomplicated\n• Cardiac rehab program after discharge\n\nFamily understanding and cooperative. Questions answered.",
  priority: "normal",
  entryDate: hoursAgo(3),
});

// Reminder
await addReminder({
  caseId: case1,
  patientName: "Rajesh Kumar",
  title: "Coronary Angiography — Confirm NPO & consent",
  note: "Ensure patient NPO from midnight. Re-confirm consent. Hold Metformin 48h prior to contrast.",
  dueDate: daysAgo(-1), // tomorrow
  channel: "in-app",
  status: "pending",
});

// ═══════════════════════════════════════════════════════════════════
// CASE 2: Diabetic Ketoacidosis (Follow-Up — Discharged recently)
// ═══════════════════════════════════════════════════════════════════
console.log("📋 Creating Case 2: DKA…");

const case2 = await createCase({
  patient: {
    name: "Ananya Patel",
    age: 24,
    gender: "female",
    bloodGroup: "O+",
    phone: "+91 87654 32100",
    emergencyContact: {
      name: "Vikram Patel",
      phone: "+91 87654 32101",
      relation: "Father",
    },
  },
  admission: {
    date: daysAgo(10),
    chiefComplaint:
      "Altered sensorium, rapid breathing, vomiting × 1 day. Known T1DM — insulin non-compliant for 3 days",
    initialDiagnosis: "Diabetic Ketoacidosis — Moderate Severity",
    visitType: "ipd",
    referredBy: "Dr. Mehta — Family Physician",
    ward: "Medical ICU → General Ward",
    roomNumber: "MICU-112 → GW-305",
  },
  discharge: {
    date: daysAgo(5),
    finalDiagnosis:
      "Diabetic Ketoacidosis (resolved) with Type 1 Diabetes Mellitus, precipitated by insulin non-compliance",
    treatmentSummary:
      "IV insulin infusion protocol × 18h → SC insulin transition. IV fluids 4L NS + KCl. Bicarbonate correction. Blood glucose normalized by Day 2. Anion gap closed by 16h. Transitioned to basal-bolus insulin (Glargine 18U + Aspart TID). Diabetes education completed.",
    outcome: "recovered",
    followUpInstructions:
      "• Blood glucose monitoring QID\n• Insulin adherence — Glargine 18U HS, Aspart 6-8U before meals\n• HbA1c recheck in 3 months\n• Diabetes educator follow-up in 1 week\n• Dietitian consultation scheduled\n• Return immediately if glucose >400 or vomiting",
    medications: [
      "Insulin Glargine 18U SC HS",
      "Insulin Aspart 6-8U SC before meals",
      "Metformin 500mg BD",
      "Pantoprazole 40mg OD",
      "Ondansetron 4mg SOS",
    ],
  },
  status: "follow-up",
  tags: ["diabetes", "DKA", "T1DM", "endocrine", "young-adult"],
  isCaseStudy: true,
});

await addVitals(case2, {
  recordedAt: daysAgo(10),
  bloodPressureSystolic: 92,
  bloodPressureDiastolic: 58,
  pulse: 124,
  temperature: 37.8,
  spO2: 95,
  respiratoryRate: 32,
  weight: 52,
  bloodSugar: 486,
  notes: "Admission — Kussmaul breathing, dehydrated, fruity odor",
});

await addVitals(case2, {
  recordedAt: daysAgo(9.5),
  bloodPressureSystolic: 100,
  bloodPressureDiastolic: 64,
  pulse: 110,
  temperature: 37.4,
  spO2: 96,
  respiratoryRate: 26,
  bloodSugar: 342,
  notes: "6h post-insulin drip — glucose trending down, anion gap 22→18",
});

await addVitals(case2, {
  recordedAt: daysAgo(9),
  bloodPressureSystolic: 108,
  bloodPressureDiastolic: 68,
  pulse: 96,
  temperature: 37.0,
  spO2: 97,
  respiratoryRate: 20,
  bloodSugar: 218,
  notes: "12h — AG normalizing (14), glucose controlled",
});

await addVitals(case2, {
  recordedAt: daysAgo(8),
  bloodPressureSystolic: 112,
  bloodPressureDiastolic: 72,
  pulse: 82,
  temperature: 36.8,
  spO2: 98,
  respiratoryRate: 16,
  bloodSugar: 164,
  notes: "Day 2 — DKA resolved, transitioned to SC insulin",
});

await addVitals(case2, {
  recordedAt: daysAgo(5),
  bloodPressureSystolic: 110,
  bloodPressureDiastolic: 70,
  pulse: 78,
  temperature: 36.6,
  spO2: 98,
  respiratoryRate: 14,
  weight: 53,
  bloodSugar: 138,
  notes: "Discharge vitals — well controlled",
});

await addTimeline(case2, {
  type: "observation",
  title: "Emergency — DKA Presentation",
  description:
    "24F T1DM (diagnosed age 14) presents with altered sensorium — GCS 13 (E3V4M6). Kussmaul breathing, dehydrated (++), fruity breath. ABG: pH 7.14, pCO2 18, HCO3 6.2, AG 28. Blood glucose 486 mg/dL. Urine ketones +++. Serum ketones 5.8 mmol/L. K+ 5.8 (pseudohyperkalemia suspected). Precipitant: stopped insulin 3 days ago (cost issues).",
  priority: "critical",
  vitals: {
    bloodPressure: "92/58",
    pulse: 124,
    spO2: 95,
    temperature: 37.8,
    respiratoryRate: 32,
  },
  entryDate: daysAgo(10),
});

await addTimeline(case2, {
  type: "treatment",
  title: "DKA Protocol Initiated",
  description:
    "1. NS 1L bolus → 500mL/h × 4h → 250mL/h\n2. Insulin drip: 0.1 U/kg/h (5.2 U/h)\n3. KCl 20mEq in each liter once K+ <5.0\n4. Bicarbonate: NaHCO3 100mEq in 400mL over 2h (pH <7.1)\n5. Ondansetron 4mg IV\n6. Monitoring: hourly BG, 2-hourly ABG, 4-hourly BMP\n7. Foley catheter for I/O",
  priority: "critical",
  entryDate: daysAgo(10),
});

await addTimeline(case2, {
  type: "lab-result",
  title: "Serial Metabolic Panel — DKA Resolution",
  description:
    "Hour 0/6/12/18:\n• pH: 7.14 → 7.24 → 7.32 → 7.38 ✓\n• HCO3: 6.2 → 12 → 18 → 22 ✓\n• AG: 28 → 22 → 14 → 12 ✓\n• K+: 5.8 → 4.2 → 3.8 → 4.0\n• Glucose: 486 → 342 → 218 → 186\n• Lactate: 3.2 → 1.8 → 1.2\n\nAnion gap closed at ~16h. DKA resolved.",
  priority: "important",
  entryDate: daysAgo(9),
});

await addTimeline(case2, {
  type: "medication",
  title: "Insulin Transition — IV to SC",
  description:
    "DKA resolved (AG closed, eating). Transition protocol:\n• Continue IV insulin 2h after first SC dose\n• Glargine 18U SC (0.35 U/kg basal)\n• Aspart 6U before meals (to titrate)\n• Blood glucose targets: 140-180 in hospital\n• Sliding scale backup\n\nPatient taught self-injection technique by diabetes educator.",
  priority: "important",
  entryDate: daysAgo(8),
});

await addTimeline(case2, {
  type: "note",
  title: "Diabetes Education — Discharge Prep",
  description:
    "Comprehensive diabetes education completed:\n• Insulin storage, drawing up, injection sites rotation\n• SMBG technique — demonstrated correct use of glucometer\n• Hypoglycemia recognition and treatment (Rule of 15)\n• Sick day management rules\n• DKA warning signs\n• Diet counseling: carb counting basics, 1800 kcal plan\n• Prescribed insulin provided free through hospital scheme (cost was barrier)\n• Follow-up: Dr. Patel Diabetes Clinic in 7 days",
  priority: "normal",
  entryDate: daysAgo(6),
});

await addReminder({
  caseId: case2,
  patientName: "Ananya Patel",
  title: "1-week Follow-up Appointment",
  note: "Check glucose diary, insulin technique, HbA1c order. Assess for hypoglycemia episodes.",
  dueDate: daysAgo(-2),
  channel: "whatsapp",
  phone: "+91 87654 32100",
  status: "pending",
});

// ═══════════════════════════════════════════════════════════════════
// CASE 3: Pneumonia / COVID Complication (Discharged — Recovered)
// ═══════════════════════════════════════════════════════════════════
console.log("📋 Creating Case 3: Pneumonia…");

const case3 = await createCase({
  patient: {
    name: "Mohammed Ismail",
    age: 67,
    gender: "male",
    bloodGroup: "A+",
    phone: "+91 91234 56789",
    emergencyContact: {
      name: "Fatima Ismail",
      phone: "+91 91234 56790",
      relation: "Daughter",
    },
  },
  admission: {
    date: daysAgo(18),
    chiefComplaint:
      "High-grade fever × 5 days, productive cough with rust-colored sputum, progressive dyspnea (NYHA III)",
    initialDiagnosis:
      "Community-Acquired Pneumonia — Right Lower Lobe, CURB-65 Score: 3 (Severe)",
    visitType: "ipd",
    referredBy: "Dr. Sinha — Pulmonologist",
    ward: "Respiratory Ward → HDU",
    roomNumber: "RW-418",
  },
  discharge: {
    date: daysAgo(8),
    finalDiagnosis:
      "Community-Acquired Pneumonia (Streptococcus pneumoniae) with parapneumonic effusion (resolved). Background COPD — GOLD Stage II.",
    treatmentSummary:
      "IV Ceftriaxone 2g OD + Azithromycin 500mg OD × 5 days → PO Amoxicillin-Clavulanate 625mg TID × 7 days. Therapeutic thoracentesis Day 3 (800mL straw-colored fluid). Supplemental O2 via nasal cannula 2-4L (weaned by Day 7). Nebulization: Salbutamol + Ipratropium QID. DVT prophylaxis.",
    outcome: "recovered",
    followUpInstructions:
      "• Complete oral antibiotics course (5 days remaining)\n• Repeat CXR in 6 weeks\n• Pulmonary function test in 3 months\n• Annual flu vaccine + Pneumococcal booster due\n• Smoking cessation program referral\n• Return if fever, worsening breathlessness, or hemoptysis",
    medications: [
      "Amoxicillin-Clavulanate 625mg TID × 5 days",
      "Salbutamol inhaler 2 puffs QID PRN",
      "Tiotropium 18mcg OD",
      "Paracetamol 500mg TID PRN",
      "Pantoprazole 40mg OD",
    ],
  },
  status: "discharged",
  tags: ["pneumonia", "respiratory", "COPD", "elderly", "pleural-effusion"],
  isCaseStudy: true,
});

await addVitals(case3, {
  recordedAt: daysAgo(18),
  bloodPressureSystolic: 138,
  bloodPressureDiastolic: 82,
  pulse: 106,
  temperature: 39.4,
  spO2: 88,
  respiratoryRate: 30,
  weight: 72,
  notes: "Admission — febrile, tachypneic, using accessory muscles",
});

await addVitals(case3, {
  recordedAt: daysAgo(16),
  bloodPressureSystolic: 132,
  bloodPressureDiastolic: 78,
  pulse: 96,
  temperature: 38.4,
  spO2: 91,
  respiratoryRate: 24,
  notes: "Day 3 post-antibiotics — still febrile but improving",
});

await addVitals(case3, {
  recordedAt: daysAgo(13),
  bloodPressureSystolic: 126,
  bloodPressureDiastolic: 76,
  pulse: 84,
  temperature: 37.2,
  spO2: 94,
  respiratoryRate: 18,
  notes: "Day 5 — afebrile, post-thoracentesis, significant improvement",
});

await addVitals(case3, {
  recordedAt: daysAgo(8),
  bloodPressureSystolic: 128,
  bloodPressureDiastolic: 78,
  pulse: 76,
  temperature: 36.7,
  spO2: 96,
  respiratoryRate: 16,
  weight: 71,
  notes: "Discharge — stable on room air",
});

await addTimeline(case3, {
  type: "observation",
  title: "Admission Assessment — Severe CAP",
  description:
    "67M, known COPD (GOLD II), presents with 5-day fever (Tmax 40.1°C), productive cough with rust-colored sputum, and worsening breathlessness. On exam: crackles RLL, dullness to percussion R base, reduced breath sounds. CXR: RLL consolidation with blunting of R costophrenic angle (effusion). CURB-65 = 3 (Confusion −, Urea 8.2, RR 30, BP ok, Age 67). Classified as SEVERE — HDU admission.",
  priority: "critical",
  vitals: {
    bloodPressure: "138/82",
    pulse: 106,
    temperature: 39.4,
    spO2: 88,
    respiratoryRate: 30,
  },
  entryDate: daysAgo(18),
});

await addTimeline(case3, {
  type: "treatment",
  title: "Antibiotic & Supportive Therapy Initiated",
  description:
    "• IV Ceftriaxone 2g OD + IV Azithromycin 500mg OD\n• O2 via nasal cannula 4L/min (target SpO2 ≥92%)\n• Nebulization: Salbutamol 5mg + Ipratropium 500mcg QID\n• IV NS 1L/24h\n• DVT prophylaxis: Enoxaparin 40mg SC OD\n• Blood cultures × 2 sent BEFORE antibiotics\n• Sputum C/S sent\n• Paracetamol 1g QID for fever",
  priority: "important",
  entryDate: daysAgo(18),
});

await addTimeline(case3, {
  type: "lab-result",
  title: "Microbiology & Bloods",
  description:
    "CBC: WBC 18,400 (N82), Hb 12.8, Plt 198K\nCRP: 186 mg/L ↑↑\nProCalcitonin: 2.4 ng/mL (bacterial infection likely)\nUrea: 8.2, Creat: 1.2\nBlood culture: Streptococcus pneumoniae (susceptible to Ceftriaxone ✓)\nSputum: >25 PMN, <10 epithelial — Good quality. S. pneumoniae isolated.\nPleural fluid: pH 7.32, LDH 480, Protein 38 — Exudate (Light's criteria positive). No organisms on Gram stain.",
  priority: "important",
  entryDate: daysAgo(16),
});

await addTimeline(case3, {
  type: "procedure",
  title: "Therapeutic Thoracentesis — R Pleural Effusion",
  description:
    "Ultrasound-guided thoracentesis performed:\n• Position: Sitting, R posterior 7th ICS\n• 800mL straw-colored fluid drained\n• Sent: biochemistry, cytology, C/S, AFB\n• Post-procedure CXR: good lung re-expansion, no pneumothorax\n• Patient reports significant relief of breathlessness\n\nFluid analysis: exudative — parapneumonic effusion. No empyema features.",
  priority: "important",
  entryDate: daysAgo(15),
});

await addTimeline(case3, {
  type: "observation",
  title: "Day 5 — Clinically Improving",
  description:
    "Afebrile × 48h. CRP trend: 186 → 92 → 34. WBC normalizing (12,200). SpO2 94% on 2L O2. Appetite improving. Cough less productive. Plan: step down to oral antibiotics today. Wean O2.",
  priority: "normal",
  entryDate: daysAgo(13),
});

await addTimeline(case3, {
  type: "note",
  title: "Discharge Summary & Counseling",
  description:
    "10-day admission for severe CAP + parapneumonic effusion. Full recovery. Discussed:\n• Complete oral antibiotic course\n• Smoking cessation (30 pack-year history) — NRT patches prescribed\n• Pneumococcal vaccine booster + annual influenza vaccine\n• COPD action plan reviewed\n• Repeat CXR in 6 weeks to confirm resolution\n• PFT in 3 months\n• Red flags explained",
  priority: "normal",
  entryDate: daysAgo(8),
});

// ═══════════════════════════════════════════════════════════════════
// CASE 4: Appendicitis — Surgical (Discharged)
// ═══════════════════════════════════════════════════════════════════
console.log("📋 Creating Case 4: Appendicitis…");

const case4 = await createCase({
  patient: {
    name: "Sneha Reddy",
    age: 19,
    gender: "female",
    bloodGroup: "AB+",
    phone: "+91 99887 76655",
    emergencyContact: {
      name: "Dr. Suresh Reddy",
      phone: "+91 99887 76656",
      relation: "Father",
    },
  },
  admission: {
    date: daysAgo(7),
    chiefComplaint:
      "Right iliac fossa pain × 18h, migrating from periumbilical area. Anorexia, low-grade fever, nausea × 1 episode vomiting",
    initialDiagnosis: "Acute Appendicitis — Alvarado Score 8/10",
    visitType: "ipd",
    referredBy: "Walk-in Emergency",
    ward: "Surgical Ward",
    roomNumber: "SW-212",
  },
  discharge: {
    date: daysAgo(4),
    finalDiagnosis:
      "Acute Suppurative Appendicitis (histopathology confirmed). Laparoscopic appendectomy — uncomplicated.",
    treatmentSummary:
      "Emergency laparoscopic appendectomy under GA. Intraoperative: inflamed, suppurative appendix, no perforation, minimal periappendicular fluid. IV Cefuroxime + Metronidazole × 48h. Transitioned to oral. Ambulated POD1. Tolerating diet POD1. Drain removed POD2.",
    outcome: "recovered",
    followUpInstructions:
      "• Wound care — keep dry × 48h, remove dressings Day 5\n• Suture removal Day 10 (dissolvable, but check)\n• Avoid heavy lifting × 4 weeks\n• Return if: fever, wound redness/discharge, increasing pain\n• Follow-up with Dr. Nair in 1 week",
    medications: [
      "Amoxicillin-Clavulanate 625mg TID × 5 days",
      "Paracetamol 500mg TID PRN",
      "Pantoprazole 40mg OD × 5 days",
    ],
  },
  status: "discharged",
  tags: ["surgical", "appendicitis", "laparoscopic", "young-adult"],
  isCaseStudy: false,
});

await addVitals(case4, {
  recordedAt: daysAgo(7),
  bloodPressureSystolic: 118,
  bloodPressureDiastolic: 72,
  pulse: 96,
  temperature: 38.2,
  spO2: 98,
  respiratoryRate: 18,
  weight: 55,
  notes: "Pre-op vitals — low-grade fever, mildly tachycardic",
});

await addVitals(case4, {
  recordedAt: daysAgo(6),
  bloodPressureSystolic: 110,
  bloodPressureDiastolic: 68,
  pulse: 82,
  temperature: 37.2,
  spO2: 99,
  respiratoryRate: 16,
  notes: "POD1 morning — stable, afebrile",
});

await addVitals(case4, {
  recordedAt: daysAgo(4),
  bloodPressureSystolic: 114,
  bloodPressureDiastolic: 70,
  pulse: 76,
  temperature: 36.6,
  spO2: 99,
  respiratoryRate: 14,
  weight: 55,
  notes: "Discharge — all normal",
});

await addTimeline(case4, {
  type: "observation",
  title: "ED Assessment — Acute Appendicitis",
  description:
    "19F, previously well, presents with 18h RIF pain (classic migration from periumbilical). Anorexia, 1 episode vomiting, low-grade fever. Exam: tenderness at McBurney's point, positive Rovsing's sign, mild guarding. No rebound. Alvarado Score 8/10. WBC 14,800 (N86). CRP 68. USG Abdomen: inflamed appendix 11mm diameter, periappendicular fat stranding. No abscess. Surgical consult obtained — LAP appendectomy tonight.",
  priority: "important",
  vitals: { bloodPressure: "118/72", pulse: 96, temperature: 38.2, spO2: 98 },
  entryDate: daysAgo(7),
});

await addTimeline(case4, {
  type: "procedure",
  title: "Laparoscopic Appendectomy",
  description:
    "Procedure: 3-port laparoscopic appendectomy\nAnesthesia: GA with ETT\nDuration: 38 minutes\nFindings:\n• Appendix: inflamed, edematous, suppurative\n• No perforation, no gangrene\n• Minimal turbid periappendicular fluid (sent for C/S)\n• Meso-appendix divided with bipolar + clips\n• Base secured with Endoloop × 2\n• Specimen retrieved in endobag\n\nEBL: <20mL. No complications. Sent for HP.",
  priority: "important",
  entryDate: daysAgo(7),
});

await addTimeline(case4, {
  type: "observation",
  title: "POD1 — Excellent Recovery",
  description:
    "Patient comfortable. Pain score 3/10 on Paracetamol. Tolerating liquids → soft diet. Ambulating independently. Drain: 15mL serous fluid. Wound: clean, no erythema. Passing flatus — bowels recovering. Plan: advance diet, continue IV ABx, remove drain tomorrow if output <30mL.",
  priority: "normal",
  entryDate: daysAgo(6),
});

await addTimeline(case4, {
  type: "lab-result",
  title: "Histopathology — Appendectomy Specimen",
  description:
    "Gross: Appendix 7.5cm × 1.1cm, congested serosa, thickened wall\nMicroscopy: Transmural neutrophilic infiltration with mucosal ulceration. Suppurative inflammation extending to serosa. No perforation. No granulomas. No parasites.\n\nDiagnosis: ACUTE SUPPURATIVE APPENDICITIS\nMargins: Clear",
  priority: "normal",
  entryDate: daysAgo(4),
});

// ═══════════════════════════════════════════════════════════════════
// CASE 5: Hypertension + CKD — OPD Follow-Up (Chronic)
// ═══════════════════════════════════════════════════════════════════
console.log("📋 Creating Case 5: HTN + CKD OPD…");

const case5 = await createCase({
  patient: {
    name: "Lakshmibai Joshi",
    age: 72,
    gender: "female",
    bloodGroup: "A-",
    phone: "+91 98112 33445",
    emergencyContact: {
      name: "Arun Joshi",
      phone: "+91 98112 33446",
      relation: "Son",
    },
  },
  admission: {
    date: daysAgo(30),
    chiefComplaint:
      "Routine follow-up — Hypertension Stage 2, CKD Stage 3b. Complaints of ankle swelling and fatigue × 2 weeks.",
    initialDiagnosis:
      "Hypertension Stage 2 with Chronic Kidney Disease Stage 3b (eGFR 38 mL/min)",
    visitType: "opd",
    referredBy: "Self — regular follow-up",
  },
  status: "follow-up",
  tags: ["hypertension", "CKD", "elderly", "chronic", "OPD", "nephrology"],
  isCaseStudy: false,
});

await addVitals(case5, {
  recordedAt: daysAgo(30),
  bloodPressureSystolic: 158,
  bloodPressureDiastolic: 94,
  pulse: 72,
  temperature: 36.5,
  spO2: 96,
  weight: 68,
  bloodSugar: 112,
  notes: "Visit 1 — BP elevated, pedal edema grade II",
});

await addVitals(case5, {
  recordedAt: daysAgo(14),
  bloodPressureSystolic: 144,
  bloodPressureDiastolic: 88,
  pulse: 70,
  temperature: 36.6,
  spO2: 97,
  weight: 66.5,
  bloodSugar: 108,
  notes: "Visit 2 — BP improving, edema reducing with diuretic",
});

await addVitals(case5, {
  recordedAt: daysAgo(1),
  bloodPressureSystolic: 136,
  bloodPressureDiastolic: 82,
  pulse: 68,
  temperature: 36.5,
  spO2: 97,
  weight: 65,
  bloodSugar: 104,
  notes: "Visit 3 — BP at target, edema resolved, feels better",
});

await addTimeline(case5, {
  type: "observation",
  title: "OPD Visit 1 — BP Uncontrolled, Edema",
  description:
    "72F with known HTN (10y) and CKD 3b (2y). Currently on Amlodipine 5mg + Telmisartan 40mg. Presents with bilateral ankle edema and fatigue. BP 158/94 (average of 2 readings). Fundoscopy: Grade I hypertensive retinopathy. Pedal edema: Grade II, pitting. Lungs clear.\n\nPlan: Add Furosemide 20mg mane, increase Telmisartan to 80mg, low-salt diet counseling, recheck in 2 weeks.",
  priority: "important",
  entryDate: daysAgo(30),
});

await addTimeline(case5, {
  type: "lab-result",
  title: "Renal Function Panel",
  description:
    "Creatinine: 1.8 mg/dL (baseline 1.6 — mild rise)\neGFR: 38 mL/min/1.73m² (CKD 3b)\nBUN: 32\nUric Acid: 7.8\nAlbumin: 3.6\nUACR: 180 mg/g (A2 — moderate albuminuria)\nK+: 4.6\nCa: 8.8, Phosphate: 4.4\nHb: 10.8 (mild anemia of CKD)\nFe: 42, TIBC: 380, Ferritin: 68\n\nAssessment: Stable CKD 3b with moderate albuminuria. Mild renal anemia.",
  priority: "important",
  entryDate: daysAgo(28),
});

await addTimeline(case5, {
  type: "medication",
  title: "Updated Prescription",
  description:
    "1. Telmisartan 80mg OD (↑ from 40mg)\n2. Amlodipine 5mg OD (continued)\n3. Furosemide 20mg mane (NEW — for edema)\n4. Ferrous Fumarate 200mg OD (for CKD anemia)\n5. Sodium Bicarbonate 500mg TID (mildly acidotic)\n6. Atorvastatin 20mg HS (cardioprotective)\n7. Low-salt, low-potassium diet advised\n8. Avoid NSAIDs strictly",
  priority: "normal",
  entryDate: daysAgo(30),
});

await addTimeline(case5, {
  type: "observation",
  title: "OPD Visit 3 — Improving",
  description:
    "BP 136/82 — at target (<140/90 for CKD). Edema resolved. Weight down 3kg (fluid loss). Fatigue improving. Cr stable at 1.7. K+ 4.4 (safe on Telmisartan 80). Patient compliant with medications and diet. Continue current regimen. Next visit in 1 month. Annual nephrology review due.",
  priority: "normal",
  entryDate: daysAgo(1),
});

await addReminder({
  caseId: case5,
  patientName: "Lakshmibai Joshi",
  title: "Monthly Follow-up — BP & Renal Function",
  note: "Check BP, weight, K+, Creatinine. Review medication compliance. Annual nephrology referral due.",
  dueDate: daysAgo(-28),
  channel: "whatsapp",
  phone: "+91 98112 33445",
  status: "pending",
});

// ═══════════════════════════════════════════════════════════════════
// CASE 6: Pediatric Dengue Fever (Active)
// ═══════════════════════════════════════════════════════════════════
console.log("📋 Creating Case 6: Pediatric Dengue…");

const case6 = await createCase({
  patient: {
    name: "Arjun Deshmukh",
    age: 8,
    gender: "male",
    bloodGroup: "O+",
    phone: "+91 88991 12233",
    emergencyContact: {
      name: "Meera Deshmukh",
      phone: "+91 88991 12234",
      relation: "Mother",
    },
  },
  admission: {
    date: daysAgo(2),
    chiefComplaint:
      "High fever × 4 days, body aches, retro-orbital headache, maculopapular rash appeared today, decreased oral intake",
    initialDiagnosis:
      "Dengue Fever — NS1 Positive. Monitoring for warning signs.",
    visitType: "ipd",
    referredBy: "Dr. Kulkarni — Pediatrician",
    ward: "Pediatric Ward",
    roomNumber: "PW-108",
  },
  status: "active",
  tags: ["dengue", "pediatric", "fever", "tropical", "monitoring"],
  isCaseStudy: false,
});

await addVitals(case6, {
  recordedAt: daysAgo(2),
  bloodPressureSystolic: 94,
  bloodPressureDiastolic: 58,
  pulse: 112,
  temperature: 39.8,
  spO2: 97,
  respiratoryRate: 24,
  weight: 25,
  notes: "Admission — febrile, mildly dehydrated, rash on trunk",
});

await addVitals(case6, {
  recordedAt: daysAgo(1),
  bloodPressureSystolic: 92,
  bloodPressureDiastolic: 56,
  pulse: 108,
  temperature: 38.4,
  spO2: 97,
  respiratoryRate: 22,
  notes: "Day 5 of fever — entering critical defervescence phase",
});

await addVitals(case6, {
  recordedAt: hoursAgo(8),
  bloodPressureSystolic: 90,
  bloodPressureDiastolic: 54,
  pulse: 104,
  temperature: 37.2,
  spO2: 98,
  respiratoryRate: 20,
  weight: 25,
  notes: "CRITICAL PHASE — defervescence. Close monitoring for plasma leak.",
});

await addTimeline(case6, {
  type: "observation",
  title: "Admission — Dengue Day 4",
  description:
    "8M presents on Day 4 of illness. High fever (Tmax 40.2°C documented), severe myalgia, retro-orbital headache, maculopapular rash appeared today (trunk + limbs). NS1 Ag: Positive. IgM: Negative (too early). Tourniquet test: Positive (>20 petechiae). No bleeding, no abdominal pain, no vomiting. Hct 38% (baseline ~35%). Plt 98,000 (dropping). Liver: palpable 2cm, non-tender. \n\nDengue with warning signs — admitted for close observation.",
  priority: "important",
  vitals: { bloodPressure: "94/58", pulse: 112, temperature: 39.8, spO2: 97 },
  entryDate: daysAgo(2),
});

await addTimeline(case6, {
  type: "treatment",
  title: "Dengue Management — Fluid Protocol",
  description:
    "1. IV Fluid: NS 5mL/kg/h × 2h → 3mL/kg/h (titrate to Hct)\n2. Paracetamol 250mg Q6H (15mg/kg/dose) — AVOID NSAIDs/Aspirin\n3. ORS ad lib\n4. Monitor: 4-hourly vitals, 6-hourly Hct + Plt\n5. Strict I/O chart\n6. Watch for: abdominal pain, persistent vomiting, mucosal bleeding, rising Hct >20% with falling Plt, restlessness, cool extremities\n7. Type & screen done (in case of need)",
  priority: "important",
  entryDate: daysAgo(2),
});

await addTimeline(case6, {
  type: "lab-result",
  title: "Serial Hematology — Dengue Monitoring",
  description:
    "Day 4 → Day 5 → Day 6:\n• Hct: 38% → 40% → 42% ↑ (rising — monitor for plasma leak)\n• Plt: 98K → 72K → 54K ↓ (falling — expected in critical phase)\n• WBC: 3,200 → 2,800 → 3,100 (leukopenia resolving)\n• AST: 86 → 124 → 142\n• ALT: 62 → 98 → 118\n• Albumin: 3.8 → 3.4 → 3.1 ↓\n\n⚠️ Entering critical phase. Hct rising + Plt falling + Albumin dropping = early plasma leak. Increase IV fluids.",
  priority: "critical",
  entryDate: hoursAgo(6),
});

await addTimeline(case6, {
  type: "complication",
  title: "⚠️ Warning Sign — Possible Plasma Leak",
  description:
    "Day 6 (critical phase): Hct increased from 38% → 42% (>10% rise). Platelet 54K. Albumin dropping (3.1). Clinically: narrow pulse pressure (90-54=36). No frank shock. No bleeding.\n\nAction: Increase IV fluid to 7mL/kg/h × 1h → reassess. If Hct continues to rise → Dextran/colloid. Prepare for possible ICU transfer. Inform parents about critical phase.",
  priority: "critical",
  entryDate: hoursAgo(4),
});

await addReminder({
  caseId: case6,
  patientName: "Arjun Deshmukh",
  title: "Hct + Plt check — 6-hourly",
  note: "Critical phase monitoring. If Hct >45% or Plt <30K, escalate to PICU.",
  dueDate: hoursAgo(-2),
  channel: "in-app",
  status: "pending",
});

// ═══════════════════════════════════════════════════════════════════
// CASE 7: Fracture — Orthopedic OPD (Follow-up)
// ═══════════════════════════════════════════════════════════════════
console.log("📋 Creating Case 7: Fracture OPD…");

const case7 = await createCase({
  patient: {
    name: "Vikram Singh",
    age: 34,
    gender: "male",
    bloodGroup: "B-",
    phone: "+91 77665 54433",
  },
  admission: {
    date: daysAgo(21),
    chiefComplaint:
      "Fall from motorcycle — pain and swelling right wrist × 2 hours. Unable to move wrist.",
    initialDiagnosis:
      "Distal Radius Fracture (Right) — Colles' Type, Extra-articular",
    visitType: "opd",
    referredBy: "Walk-in OPD",
  },
  status: "follow-up",
  tags: ["orthopedic", "fracture", "OPD", "cast", "trauma"],
  isCaseStudy: false,
});

await addVitals(case7, {
  recordedAt: daysAgo(21),
  bloodPressureSystolic: 132,
  bloodPressureDiastolic: 84,
  pulse: 88,
  temperature: 36.8,
  spO2: 99,
  weight: 82,
  notes: "Initial visit — pain-related mild HTN",
});

await addVitals(case7, {
  recordedAt: daysAgo(7),
  bloodPressureSystolic: 124,
  bloodPressureDiastolic: 78,
  pulse: 76,
  temperature: 36.6,
  spO2: 99,
  weight: 82,
  notes: "2-week follow-up — afebrile, cast intact",
});

await addTimeline(case7, {
  type: "observation",
  title: "OPD Assessment — Colles' Fracture",
  description:
    "34M RTA (motorcycle fall, FOOSH). R wrist: swelling, dinner-fork deformity, tender over distal radius. Neurovascular intact (radial pulse +, sensation normal, CRT <2s). X-ray R Wrist AP/Lat: Distal radius fracture — dorsal angulation 25°, 6mm shortening, no intra-articular extension. Colles' pattern.\n\nPlan: Closed reduction under hematoma block → Below-elbow POP cast. Check post-reduction X-ray.",
  priority: "important",
  vitals: { bloodPressure: "132/84", pulse: 88 },
  entryDate: daysAgo(21),
});

await addTimeline(case7, {
  type: "procedure",
  title: "Closed Reduction + POP Cast",
  description:
    "Procedure under hematoma block (5mL 2% Lidocaine into fracture site):\n• Traction-countertraction with ulnar deviation\n• Dorsal angulation corrected\n• Below-elbow POP cast applied in slight flexion + ulnar deviation\n• Post-reduction X-ray: satisfactory alignment, angulation <10°, shortening corrected\n• Arm elevation sling\n• Cast care instructions given\n• Follow-up in 1 week for cast check, 2 weeks for X-ray",
  priority: "normal",
  entryDate: daysAgo(21),
});

await addTimeline(case7, {
  type: "observation",
  title: "2-Week Follow-up — Satisfactory",
  description:
    "Cast intact, no pressure complaints. Fingers: warm, mobile, sensation intact. No excessive swelling. Check X-ray through cast: alignment maintained. Pain: 2/10 on Paracetamol PRN.\n\nPlan: Continue cast × 4 more weeks (total 6 weeks). Finger exercises. Review at 6 weeks for cast removal + repeat X-ray. If healed → begin wrist mobilization + physio.",
  priority: "normal",
  entryDate: daysAgo(7),
});

await addReminder({
  caseId: case7,
  patientName: "Vikram Singh",
  title: "6-week Cast Removal Appointment",
  note: "X-ray to confirm union. If healed, remove cast and start physiotherapy referral.",
  dueDate: daysAgo(-21),
  channel: "sms",
  phone: "+91 77665 54433",
  status: "pending",
});

// ═══════════════════════════════════════════════════════════════════
// Update counter
// ═══════════════════════════════════════════════════════════════════
const counterRef = doc(db, col("counters"), "caseCounter");
await setDoc(counterRef, { count: caseSeq }, { merge: true });

console.log("\n✅ Seed complete! Created:");
console.log(`   • ${caseSeq} detailed patient cases`);
console.log("   • Multiple vitals records per case (36 total)");
console.log("   • Detailed timeline entries (28 total)");
console.log("   • Follow-up reminders (5 total)");
console.log("   • Case types: Active/Discharged/Follow-up, IPD/OPD");
console.log(
  "   • Specialties: Cardiology, Endocrine, Pulmonology, Surgery, Nephrology, Pediatrics, Orthopedics",
);
console.log("\n🔑 Login with: demo@caselog.app / demo123456");

process.exit(0);
